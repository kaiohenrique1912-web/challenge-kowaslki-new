import { AMENITY_CODES, type AmenityCode } from "../domain/amenities.ts";
import { PROPERTY_TYPES, type PropertyType } from "../domain/property.ts";
import {
  type BoundingBox,
  DEFAULT_SORT,
  MAX_NEIGHBORHOOD_FILTER,
  MIN_COUNT_FILTER_MAX,
  type PublishedWithin,
  type SortOrder,
} from "../domain/search.ts";
import { normalizeFilters, type PropertyFilters, type Range, type SearchState } from "./state.ts";

/**
 * Contrato da URL da busca (docs/architecture.md §8) — ÚNICO lugar que lê e escreve a URL.
 * Valores inválidos são descartados em silêncio: a página nunca quebra por URL ruim.
 */

export const SEARCH_BASE_PATH = "/comprar/imovel";

const TYPE_SLUGS: Record<PropertyType, string> = {
  APARTMENT: "apartamento",
  HOUSE: "casa",
  CONDO_HOUSE: "casa-condominio",
  STUDIO: "studio",
};

const SORT_SLUGS: Record<SortOrder, string> = {
  NEAREST: "proximos",
  RELEVANCE: "relevancia",
  NEWEST: "recentes",
  PRICE_ASC: "menor-valor",
  PRICE_DESC: "maior-valor",
  RENTAL_YIELD_DESC: "maior-retorno",
};

const PUBLISHED_SLUGS: Record<PublishedWithin, string> = {
  TODAY: "hoje",
  LAST_7_DAYS: "7d",
  LAST_15_DAYS: "15d",
  LAST_30_DAYS: "30d",
  LAST_2_MONTHS: "2m",
  LAST_6_MONTHS: "6m",
};

/** Comodidade na URL: código em kebab-case (POOL → pool, AIR_CONDITIONING → air-conditioning). */
const amenitySlug = (code: AmenityCode) => code.toLowerCase().replaceAll("_", "-");

const invert = <K extends string>(map: Record<K, string>) =>
  new Map(Object.entries(map).map(([k, v]) => [v as string, k as K]));
const TYPE_BY_SLUG = invert(TYPE_SLUGS);
const SORT_BY_SLUG = invert(SORT_SLUGS);
const PUBLISHED_BY_SLUG = invert(PUBLISHED_SLUGS);
const AMENITY_BY_SLUG = new Map(AMENITY_CODES.map((c) => [amenitySlug(c), c]));

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseList<T>(value: string | null, lookup: (item: string) => T | undefined): T[] {
  if (!value) return [];
  const items = value
    .split(",")
    .map((item) => lookup(item.trim()))
    .filter((item): item is T => item !== undefined);
  return [...new Set(items)];
}

function parseInteger(value: string | null, min: number, max: number): number | undefined {
  if (value === null || !/^\d+$/.test(value)) return undefined;
  const n = Number(value);
  return n >= min && n <= max ? n : undefined;
}

function parseRange(params: URLSearchParams, prefix: string): Range | undefined {
  const min = parseInteger(params.get(`${prefix}-min`), 0, Number.MAX_SAFE_INTEGER);
  const max = parseInteger(params.get(`${prefix}-max`), 0, Number.MAX_SAFE_INTEGER);
  if (min === undefined && max === undefined) return undefined;
  if (min !== undefined && max !== undefined && min > max) return undefined; // inválido: ignora
  return { ...(min !== undefined && { min }), ...(max !== undefined && { max }) };
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === "sim") return true;
  if (value === "nao") return false;
  return undefined;
}

/** "N,W,S,E" → bbox válida (dentro do globo, norte > sul, leste > oeste). */
function parseBbox(value: string | null): BoundingBox | undefined {
  if (!value) return undefined;
  const parts = value.split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return undefined;
  const [north, west, south, east] = parts as [number, number, number, number];
  const valid =
    north > south && east > west && north <= 90 && south >= -90 && east <= 180 && west >= -180;
  return valid ? { north, west, south, east } : undefined;
}

/**
 * URL → estado. `pathSlug` é o segmento opcional de `/comprar/imovel/:bairroSlug`.
 */
export function parseSearchState(params: URLSearchParams, pathSlug?: string | null): SearchState {
  const slugs = [
    ...(pathSlug ? [pathSlug] : []),
    ...parseList(params.get("bairros"), (s) => (SLUG_PATTERN.test(s) ? s : undefined)),
  ].filter((s) => SLUG_PATTERN.test(s));
  const neighborhoodSlugs = [...new Set(slugs)].slice(0, MAX_NEIGHBORHOOD_FILTER);

  const filters: PropertyFilters = normalizeFilters({
    types: parseList(params.get("tipos"), (s) => TYPE_BY_SLUG.get(s)),
    price: parseRange(params, "preco"),
    monthlyCost: parseRange(params, "condo-iptu"),
    area: parseRange(params, "area"),
    minBedrooms: parseInteger(params.get("quartos"), 1, MIN_COUNT_FILTER_MAX.bedrooms),
    minBathrooms: parseInteger(params.get("banheiros"), 1, MIN_COUNT_FILTER_MAX.bathrooms),
    minSuites: parseInteger(params.get("suites"), 1, MIN_COUNT_FILTER_MAX.suites),
    minParkingSpaces: parseInteger(params.get("vagas"), 1, MIN_COUNT_FILTER_MAX.parkingSpaces),
    publishedWithin: PUBLISHED_BY_SLUG.get(params.get("publicado") ?? ""),
    furnished: parseBoolean(params.get("mobiliado")),
    nearSubway: parseBoolean(params.get("metro")),
    exclusive: parseBoolean(params.get("exclusivo")),
    rented: parseBoolean(params.get("alugado")) === true ? true : undefined,
    amenities: parseList(params.get("itens"), (s) => AMENITY_BY_SLUG.get(s)),
  });

  const mapArea = parseBbox(params.get("area-mapa"));
  const mapZoom = mapArea ? parseInteger(params.get("zoom"), 0, 22) : undefined;
  const sort = SORT_BY_SLUG.get(params.get("ordem") ?? "") ?? DEFAULT_SORT;
  const onlyFavorites = params.get("favoritos") === "sim";

  return {
    neighborhoodSlugs,
    ...(mapArea && { mapArea }),
    ...(mapZoom !== undefined && { mapZoom }),
    filters,
    ...(onlyFavorites && { onlyFavorites }),
    sort,
  };
}

const round = (n: number) => Number(n.toFixed(5));

/** Estado → { pathname, search } (ordem dos parâmetros estável). */
export function serializeSearchState(state: SearchState): { pathname: string; search: string } {
  const params = new URLSearchParams();
  const { filters: f } = state;
  const [firstSlug, ...otherSlugs] = state.neighborhoodSlugs;
  const pathname =
    firstSlug && otherSlugs.length === 0 ? `${SEARCH_BASE_PATH}/${firstSlug}` : SEARCH_BASE_PATH;
  if (state.neighborhoodSlugs.length > 1) params.set("bairros", state.neighborhoodSlugs.join(","));

  if (state.mapArea) {
    const { north, west, south, east } = state.mapArea;
    params.set("area-mapa", [north, west, south, east].map(round).join(","));
    if (state.mapZoom !== undefined) params.set("zoom", String(state.mapZoom));
  }

  if (f.types?.length) {
    const ordered = PROPERTY_TYPES.filter((t) => f.types?.includes(t));
    params.set("tipos", ordered.map((t) => TYPE_SLUGS[t]).join(","));
  }
  const setRange = (prefix: string, range?: Range) => {
    if (range?.min !== undefined) params.set(`${prefix}-min`, String(range.min));
    if (range?.max !== undefined) params.set(`${prefix}-max`, String(range.max));
  };
  setRange("preco", f.price);
  setRange("condo-iptu", f.monthlyCost);
  setRange("area", f.area);
  if (f.minBedrooms !== undefined) params.set("quartos", String(f.minBedrooms));
  if (f.minBathrooms !== undefined) params.set("banheiros", String(f.minBathrooms));
  if (f.minSuites !== undefined) params.set("suites", String(f.minSuites));
  if (f.minParkingSpaces !== undefined) params.set("vagas", String(f.minParkingSpaces));
  if (f.publishedWithin) params.set("publicado", PUBLISHED_SLUGS[f.publishedWithin]);
  const setBool = (key: string, value?: boolean) => {
    if (value !== undefined) params.set(key, value ? "sim" : "nao");
  };
  setBool("mobiliado", f.furnished);
  setBool("metro", f.nearSubway);
  setBool("exclusivo", f.exclusive);
  if (f.rented) params.set("alugado", "sim");
  if (f.amenities?.length) {
    const ordered = AMENITY_CODES.filter((c) => f.amenities?.includes(c));
    params.set("itens", ordered.map(amenitySlug).join(","));
  }
  if (state.onlyFavorites) params.set("favoritos", "sim");
  if (state.sort !== DEFAULT_SORT) params.set("ordem", SORT_SLUGS[state.sort]);

  const search = params.toString();
  return { pathname, search: search ? `?${search}` : "" };
}

/** Atalho: estado → "/comprar/imovel/pinheiros?quartos=3". */
export function searchStateToUrl(state: SearchState): string {
  const { pathname, search } = serializeSearchState(state);
  return `${pathname}${search}`;
}
