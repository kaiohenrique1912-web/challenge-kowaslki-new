import type { AmenityCode } from "../domain/amenities.ts";
import type { PropertyType } from "../domain/property.ts";
import {
  type BoundingBox,
  DEFAULT_SORT,
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
  filters: PropertyFilters;
  sort: SortOrder;
};

export const EMPTY_SEARCH_STATE: SearchState = {
  neighborhoodSlugs: [],
  filters: {},
  sort: DEFAULT_SORT,
};

/** Remove chaves vazias (undefined, faixas sem lados, listas vazias). */
export function normalizeFilters(filters: PropertyFilters): PropertyFilters {
  const result: PropertyFilters = {};
  for (const [key, value] of Object.entries(filters) as [keyof PropertyFilters, unknown][]) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      const range = value as Range;
      if (range.min === undefined && range.max === undefined) continue;
    }
    (result as Record<string, unknown>)[key] = value;
  }
  return result;
}

/** Quantos filtros de atributo estão ativos (contador do botão "Mais filtros"). */
export function countActiveFilters(filters: PropertyFilters): number {
  return Object.keys(normalizeFilters(filters)).length;
}

/**
 * Filtros enviados à API (docs/architecture.md §7.2):
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
  };
  if (mode === "map") return filters;
  if (state.mapArea) return { ...filters, bbox: state.mapArea };
  if (state.neighborhoodSlugs.length > 0) {
    return { ...filters, neighborhoodSlugs: state.neighborhoodSlugs };
  }
  return filters;
}
