import type { AmenityCode } from "../domain/amenities.ts";
import type { PropertyType } from "../domain/property.ts";
import {
  type BoundingBox,
  DEFAULT_MIN_COUNTS,
  DEFAULT_SORT,
  FILTER_RANGE_BOUNDS,
  type LatLng,
  type PublishedWithin,
  type SortOrder,
} from "../domain/search.ts";
import type { SearchFilters } from "../validation/search.ts";

/**
 * Estado da tela de busca (o que vive na URL — docs/architecture.md §8). Campos ausentes =
 * "Tanto faz". Sem `null`: o estado é sempre normalizado.
 */

/** Faixa mínimo/máximo; um lado ausente = sem limite. */
export type Range = { min?: number; max?: number };

/** Filtros de atributos do imóvel (tudo menos localização e favoritos). */
export type PropertyFilters = {
  types?: PropertyType[];
  price?: Range;
  monthlyCost?: Range;
  area?: Range;
  minBedrooms?: number;
  minBathrooms?: number;
  minSuites?: number;
  minParkingSpaces?: number;
  publishedWithin?: PublishedWithin;
  furnished?: boolean;
  nearSubway?: boolean;
  exclusive?: boolean;
  /** Só `true` filtra ("Compre já alugado"). */
  rented?: boolean;
  amenities?: AmenityCode[];
};

export type SearchState = {
  /** Bairro(s) do contexto de localização (business-rules §4.1). */
  neighborhoodSlugs: string[];
  /** Área do mapa fixada pelo usuário ao mover o mapa; quando existe, a lista filtra por ela. */
  mapArea?: BoundingBox;
  mapZoom?: number;
  /**
   * "Desenhar área de busca": polígono desenhado no mapa. Quando existe, substitui bairro e área
   * do mapa — lista e clusters ficam só dentro dele (business-rules §4.1).
   */
  drawnArea?: LatLng[];
  filters: PropertyFilters;
  /** "Ver favoritos": só imóveis favoritados pelo usuário (x-user-id). */
  onlyFavorites?: boolean;
  sort: SortOrder;
};

export const EMPTY_SEARCH_STATE: SearchState = {
  neighborhoodSlugs: [],
  filters: {},
  sort: DEFAULT_SORT,
};

/** Tira os lados da faixa iguais aos limites do painel (= sem limite). */
function trimRange(range: Range, bounds?: { min: number; max: number }): Range {
  if (!bounds) return range;
  return {
    ...(range.min !== undefined && range.min > bounds.min && { min: range.min }),
    ...(range.max !== undefined && range.max < bounds.max && { max: range.max }),
  };
}

/**
 * Remove o que não filtra nada: chaves vazias, faixas sem lados, listas vazias, lados de faixa
 * iguais aos limites do painel (`FILTER_RANGE_BOUNDS`) e os mínimos padrão "1+ quartos" e
 * "1+ banheiros" (`DEFAULT_MIN_COUNTS`).
 */
export function normalizeFilters(filters: PropertyFilters): PropertyFilters {
  const result: PropertyFilters = {};
  for (const [key, value] of Object.entries(filters) as [keyof PropertyFilters, unknown][]) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (
      key in DEFAULT_MIN_COUNTS &&
      value === DEFAULT_MIN_COUNTS[key as keyof typeof DEFAULT_MIN_COUNTS]
    ) {
      continue;
    }
    let stored = value;
    if (typeof value === "object" && !Array.isArray(value)) {
      const range = trimRange(
        value as Range,
        FILTER_RANGE_BOUNDS[key as keyof typeof FILTER_RANGE_BOUNDS],
      );
      if (range.min === undefined && range.max === undefined) continue;
      stored = range;
    }
    (result as Record<string, unknown>)[key] = stored;
  }
  return result;
}

/** Quantos filtros de atributo estão ativos (contador do botão "Mais filtros"). */
export function countActiveFilters(filters: PropertyFilters): number {
  return Object.keys(normalizeFilters(filters)).length;
}

/**
 * Filtros enviados à API (docs/architecture.md §7.2):
 * - com área desenhada, lista e mapa filtram pelo polígono (e só por ele, quanto a local);
 * - `list`: com área do mapa fixada, filtra SÓ pela área (o bairro continua só como contexto);
 *   sem ela, filtra pelos bairros.
 * - `map`: nunca envia bairros — os clusters mostram também imóveis de outros bairros; a área vem
 *   do argumento `bbox` da query do mapa.
 */
export function toApiFilters(state: SearchState, mode: "list" | "map"): SearchFilters {
  const f = normalizeFilters(state.filters);
  const filters: SearchFilters = {
    ...(f.types && { types: f.types }),
    ...(f.price && { price: f.price }),
    ...(f.monthlyCost && { monthlyCost: f.monthlyCost }),
    ...(f.area && { area: f.area }),
    ...(f.minBedrooms !== undefined && { minBedrooms: f.minBedrooms }),
    ...(f.minBathrooms !== undefined && { minBathrooms: f.minBathrooms }),
    ...(f.minSuites !== undefined && { minSuites: f.minSuites }),
    ...(f.minParkingSpaces !== undefined && { minParkingSpaces: f.minParkingSpaces }),
    ...(f.publishedWithin && { publishedWithin: f.publishedWithin }),
    ...(f.furnished !== undefined && { furnished: f.furnished }),
    ...(f.nearSubway !== undefined && { nearSubway: f.nearSubway }),
    ...(f.exclusive !== undefined && { exclusive: f.exclusive }),
    ...(f.rented === true && { rented: true }),
    ...(f.amenities && { amenities: f.amenities }),
    ...(state.onlyFavorites && { onlyFavorites: true }),
  };
  if (state.drawnArea) return { ...filters, polygon: state.drawnArea };
  if (mode === "map") return filters;
  if (state.mapArea) return { ...filters, bbox: state.mapArea };
  if (state.neighborhoodSlugs.length > 0) {
    return { ...filters, neighborhoodSlugs: state.neighborhoodSlugs };
  }
  return filters;
}
