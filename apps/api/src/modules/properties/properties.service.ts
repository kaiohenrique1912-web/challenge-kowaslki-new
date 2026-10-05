import {
  type BoundingBox,
  cellSizeForZoom,
  clusterId,
  DEFAULT_SORT,
  type LatLng,
  MAX_MAP_CELLS,
  mapClustersArgsSchema,
  SAO_PAULO_CENTER,
  SEARCH_PAGE_SIZE,
  type SearchFilters,
  searchArgsSchema,
} from "@qa/shared";
import type { GraphQLContext } from "../../context.ts";
import { badUserInput, parseOrThrow } from "../../graphql/errors.ts";
import type { NeighborhoodRecord } from "../neighborhoods/neighborhood-record.ts";
import { findNeighborhoodsBySlugs } from "../neighborhoods/neighborhoods.repository.ts";
import {
  aggregateMapCells,
  countProperties,
  findActivePropertyById,
  findPropertiesPage,
  type MapCellRow,
} from "./properties.repository.ts";
import type { PropertyConnectionModel, PropertyRecord } from "./property-record.ts";
import { buildPropertyWhere } from "./property-where.ts";
import { buildSortSpec, decodeCursor, encodeCursor } from "./sort.ts";

/**
 * Regras da busca (business-rules §4): valida a entrada com os schemas de packages/shared,
 * aplica defaults e monta a consulta. Não escreve SQL — isso é do repositório.
 */

/** Regras que dependem do banco/contexto e não cabem no schema zod. */
function checkFilterContext(ctx: GraphQLContext, filters: SearchFilters | null | undefined) {
  if (filters?.onlyFavorites && !ctx.userId) {
    throw badUserInput(
      "Para ver favoritos, envie o identificador do usuário (header x-user-id).",
      "filters.onlyFavorites",
    );
  }
  const slugs = filters?.neighborhoodSlugs ?? [];
  if (slugs.length === 0) return [];
  const found = findNeighborhoodsBySlugs(ctx.db, slugs);
  const missing = slugs.filter((slug) => !found.some((n) => n.slug === slug));
  if (missing.length > 0) {
    throw badUserInput(
      `Bairro não encontrado: ${missing.join(", ")}.`,
      "filters.neighborhoodSlugs",
    );
  }
  // Mantém a ordem pedida (o primeiro bairro é a origem de "Mais próximos").
  return slugs.map((slug) => found.find((n) => n.slug === slug) as NeighborhoodRecord);
}

/** Origem de NEAREST: informada → centro do 1º bairro → centro da bbox → Praça da Sé. */
function resolveOrigin(
  origin: LatLng | null | undefined,
  neighborhoods: NeighborhoodRecord[],
  bbox: BoundingBox | null | undefined,
): LatLng {
  if (origin) return origin;
  const first = neighborhoods[0];
  if (first) return { lat: first.centerLat, lng: first.centerLng };
  if (bbox) return { lat: (bbox.north + bbox.south) / 2, lng: (bbox.east + bbox.west) / 2 };
  return SAO_PAULO_CENTER;
}

export function searchProperties(ctx: GraphQLContext, rawArgs: unknown): PropertyConnectionModel {
  const args = parseOrThrow(searchArgsSchema, rawArgs);
  const neighborhoods = checkFilterContext(ctx, args.filters);
  const sort = args.sort ?? DEFAULT_SORT;
  const first = args.first ?? SEARCH_PAGE_SIZE.default;
  const cursor = args.after ? decodeCursor(args.after, sort) : null;

  const origin =
    sort === "NEAREST"
      ? (cursor?.origin ?? resolveOrigin(args.origin, neighborhoods, args.filters?.bbox))
      : null;
  const sortSpec = buildSortSpec(sort, origin);
  const where = buildPropertyWhere(args.filters, { userId: ctx.userId, now: ctx.now });

  let nodes: PropertyRecord[] = [];
  let endCursor: string | null = null;
  let hasNextPage = false;
  if (first > 0) {
    const page = findPropertiesPage(ctx.db, where, sortSpec, cursor, first);
    nodes = page.records;
    hasNextPage = page.hasMore;
    const last = nodes.at(-1);
    if (last && page.lastSortValue !== null) {
      endCursor = encodeCursor({
        sort,
        value: page.lastSortValue,
        id: last.id,
        ...(origin ? { origin } : {}),
      });
    }
  }

  let total: number | undefined;
  return {
    nodes,
    pageInfo: { endCursor, hasNextPage },
    countTotal: () => {
      total ??= countProperties(ctx.db, where);
      return total;
    },
  };
}

export function getPropertyById(ctx: GraphQLContext, rawId: string): PropertyRecord | null {
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return findActivePropertyById(ctx.db, id);
}

export type MapClusterModel = {
  id: string;
  center: LatLng;
  count: number;
  bounds: BoundingBox;
  propertyId: string | null;
};

export function getMapClusters(ctx: GraphQLContext, rawArgs: unknown) {
  const args = parseOrThrow(mapClustersArgsSchema, rawArgs);
  checkFilterContext(ctx, args.filters);
  // A área do mapa vem de `bbox`; um `filters.bbox` é ignorado aqui.
  const where = buildPropertyWhere(
    { ...args.filters, bbox: args.bbox },
    { userId: ctx.userId, now: ctx.now },
  );

  let zoom = args.zoom;
  let cells = aggregateMapCells(ctx.db, where, cellSizeForZoom(zoom));
  // Células demais: agrega com zoom menor juntando blocos 2×2 em memória (a célula do zoom z−1
  // tem o dobro do tamanho e a mesma origem, então linha/coluna viram floor(n / 2)).
  while (cells.length > MAX_MAP_CELLS && zoom > 0) {
    zoom -= 1;
    cells = mergeCellsToParentZoom(cells);
  }

  const clusters: MapClusterModel[] = cells.map((cell) => ({
    id: clusterId(zoom, cell.row, cell.col),
    center: { lat: cell.lat, lng: cell.lng },
    count: cell.count,
    bounds: { north: cell.north, south: cell.south, east: cell.east, west: cell.west },
    propertyId: cell.count === 1 ? String(cell.any_id) : null,
  }));
  const totalCount = clusters.reduce((sum, c) => sum + c.count, 0);
  return { clusters, totalCount, zoom };
}

/** Junta células vizinhas 2×2 no zoom anterior (média ponderada, extremos e menor id). */
export function mergeCellsToParentZoom(cells: MapCellRow[]): MapCellRow[] {
  const parents = new Map<string, MapCellRow>();
  for (const cell of cells) {
    const row = Math.floor(cell.row / 2);
    const col = Math.floor(cell.col / 2);
    const key = `${row}:${col}`;
    const parent = parents.get(key);
    if (!parent) {
      parents.set(key, { ...cell, row, col });
      continue;
    }
    const count = parent.count + cell.count;
    parent.lat = (parent.lat * parent.count + cell.lat * cell.count) / count;
    parent.lng = (parent.lng * parent.count + cell.lng * cell.count) / count;
    parent.count = count;
    parent.south = Math.min(parent.south, cell.south);
    parent.north = Math.max(parent.north, cell.north);
    parent.west = Math.min(parent.west, cell.west);
    parent.east = Math.max(parent.east, cell.east);
    parent.any_id = Math.min(parent.any_id, cell.any_id);
  }
  return [...parents.values()];
}
