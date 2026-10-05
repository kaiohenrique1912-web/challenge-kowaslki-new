import type { Database, SQLQueryBindings } from "bun:sqlite";
import type { AmenityCode } from "@qa/shared";
import {
  PROPERTY_COLUMNS,
  type PropertyRecord,
  type PropertyRow,
  toPropertyRecord,
} from "./property-record.ts";
import type { WhereClause } from "./property-where.ts";
import type { SortSpec } from "./sort.ts";

/**
 * Repositório de imóveis: só SQL parametrizado, sem regra de negócio (architecture §11).
 * Os filtros chegam prontos de `buildPropertyWhere`.
 */

const placeholders = (count: number) => Array.from({ length: count }, () => "?").join(", ");

export type SearchPage = {
  records: PropertyRecord[];
  lastSortValue: number | null;
  hasMore: boolean;
};

export function findPropertiesPage(
  db: Database,
  where: WhereClause,
  sort: SortSpec,
  after: { value: number; id: number } | null,
  limit: number,
): SearchPage {
  const params: SQLQueryBindings[] = [...sort.exprParams, ...where.params];
  let keyset = "";
  if (after) {
    // Row values do SQLite: (valor, id) depois do último item visto, no sentido da ordenação.
    keyset = ` AND (${sort.expr}, p.id) ${sort.direction === "DESC" ? "<" : ">"} (?, ?)`;
    params.push(...sort.exprParams, after.value, after.id);
  }
  params.push(...sort.exprParams, limit + 1);

  const rows = db
    .query<PropertyRow & { sort_value: number }, SQLQueryBindings[]>(`
      SELECT ${PROPERTY_COLUMNS}, ${sort.expr} AS sort_value
      FROM properties p
      WHERE ${where.sql}${keyset}
      ORDER BY ${sort.expr} ${sort.direction}, p.id ${sort.direction}
      LIMIT ?`)
    .all(...params);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  return {
    records: page.map(toPropertyRecord),
    lastSortValue: page.at(-1)?.sort_value ?? null,
    hasMore,
  };
}

export function countProperties(db: Database, where: WhereClause): number {
  const row = db
    .query<{ total: number }, SQLQueryBindings[]>(
      `SELECT COUNT(*) AS total FROM properties p WHERE ${where.sql}`,
    )
    .get(...where.params);
  return row?.total ?? 0;
}

export function findActivePropertyById(db: Database, id: number): PropertyRecord | null {
  const row = db
    .query<PropertyRow, [number]>(
      `SELECT ${PROPERTY_COLUMNS} FROM properties p WHERE p.id = ? AND p.status = 'ACTIVE'`,
    )
    .get(id);
  return row ? toPropertyRecord(row) : null;
}

export type MapCellRow = {
  row: number;
  col: number;
  count: number;
  lat: number;
  lng: number;
  south: number;
  north: number;
  west: number;
  east: number;
  any_id: number;
};

/** Agrega os imóveis do WHERE em células da grade (architecture §7.1). */
export function aggregateMapCells(
  db: Database,
  where: WhereClause,
  cellSize: number,
): MapCellRow[] {
  return db
    .query<MapCellRow, SQLQueryBindings[]>(`
      SELECT CAST((p.lat + 90) / ? AS INTEGER) AS row, CAST((p.lng + 180) / ? AS INTEGER) AS col,
        COUNT(*) AS count, AVG(p.lat) AS lat, AVG(p.lng) AS lng,
        MIN(p.lat) AS south, MAX(p.lat) AS north, MIN(p.lng) AS west, MAX(p.lng) AS east,
        MIN(p.id) AS any_id
      FROM properties p
      WHERE ${where.sql}
      GROUP BY row, col`)
    .all(cellSize, cellSize, ...where.params);
}

export type PhotoRecord = { propertyId: number; position: number; url: string };

export function findPhotosByPropertyIds(db: Database, ids: readonly number[]): PhotoRecord[] {
  if (ids.length === 0) return [];
  return db
    .query<PhotoRecord, number[]>(`
      SELECT property_id AS propertyId, position, url FROM property_photos
      WHERE property_id IN (${placeholders(ids.length)}) ORDER BY property_id, position`)
    .all(...ids);
}

export function findAmenitiesByPropertyIds(
  db: Database,
  ids: readonly number[],
): { propertyId: number; code: AmenityCode }[] {
  if (ids.length === 0) return [];
  return db
    .query<{ propertyId: number; code: AmenityCode }, number[]>(`
      SELECT property_id AS propertyId, amenity_code AS code FROM property_amenities
      WHERE property_id IN (${placeholders(ids.length)})`)
    .all(...ids);
}

export function findFavoritePropertyIds(
  db: Database,
  userId: string,
  ids: readonly number[],
): number[] {
  if (ids.length === 0) return [];
  return db
    .query<{ property_id: number }, SQLQueryBindings[]>(`
      SELECT property_id FROM favorites
      WHERE user_id = ? AND property_id IN (${placeholders(ids.length)})`)
    .all(userId, ...ids)
    .map((r) => r.property_id);
}
