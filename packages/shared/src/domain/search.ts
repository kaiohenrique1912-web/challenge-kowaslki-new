/** Regras da busca. Fonte: docs/business-rules.md §4. */

export const SORT_ORDERS = [
  "NEAREST",
  "RELEVANCE",
  "NEWEST",
  "PRICE_ASC",
  "PRICE_DESC",
  "RENTAL_YIELD_DESC",
] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const DEFAULT_SORT: SortOrder = "RELEVANCE";

/** Ordem igual à do menu do original. */
export const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  NEAREST: "Mais próximos",
  RELEVANCE: "Mais relevantes",
  NEWEST: "Mais recentes",
  PRICE_ASC: "Menor valor",
  PRICE_DESC: "Maior valor",
  RENTAL_YIELD_DESC: "Maior retorno com aluguel",
};

export const PUBLISHED_WITHIN = [
  "TODAY",
  "LAST_7_DAYS",
  "LAST_15_DAYS",
  "LAST_30_DAYS",
  "LAST_2_MONTHS",
  "LAST_6_MONTHS",
] as const;
export type PublishedWithin = (typeof PUBLISHED_WITHIN)[number];

export const PUBLISHED_WITHIN_LABELS: Record<PublishedWithin, string> = {
  TODAY: "Hoje",
  LAST_7_DAYS: "Últimos 7 dias",
  LAST_15_DAYS: "Últimos 15 dias",
  LAST_30_DAYS: "Últimos 30 dias",
  LAST_2_MONTHS: "Últimos 2 meses",
  LAST_6_MONTHS: "Últimos 6 meses",
};

const DAY_MS = 86_400_000;
/** São Paulo usa UTC−3 o ano todo (sem horário de verão desde 2019). */
const SAO_PAULO_OFFSET_MS = -3 * 3_600_000;

const PUBLISHED_WITHIN_DAYS: Record<Exclude<PublishedWithin, "TODAY">, number> = {
  LAST_7_DAYS: 7,
  LAST_15_DAYS: 15,
  LAST_30_DAYS: 30,
  LAST_2_MONTHS: 60,
  LAST_6_MONTHS: 180,
};

/** Instante (epoch ms) a partir do qual o anúncio precisa ter sido publicado. */
export function publishedWithinStart(value: PublishedWithin, now: number): number {
  if (value === "TODAY") {
    const local = now + SAO_PAULO_OFFSET_MS;
    return local - (local % DAY_MS) - SAO_PAULO_OFFSET_MS;
  }
  return now - PUBLISHED_WITHIN_DAYS[value] * DAY_MS;
}

export const SEARCH_PAGE_SIZE = { default: 24, max: 48 } as const;
export const MAX_NEIGHBORHOOD_FILTER = 10;
/** Pílulas "1+ … 4+" de quartos, banheiros e suítes; vagas vão até 3+. */
export const MIN_COUNT_FILTER_MAX = { bedrooms: 4, bathrooms: 4, suites: 4, parkingSpaces: 3 };

export const LOCATION_SUGGESTIONS = { minQueryLength: 2, defaultLimit: 8, maxLimit: 20 } as const;

export type IntRange = { min?: number | null; max?: number | null };
export type BoundingBox = { north: number; south: number; east: number; west: number };
export type LatLng = { lat: number; lng: number };

/** Opções de "Valor do imóvel até" do card de busca da home (R$). */
export const HOME_PRICE_MAX_OPTIONS = [
  300_000, 500_000, 750_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000,
] as const;

/** Escalas dos sliders de faixa do painel de filtros (os campos de texto aceitam qualquer valor). */
export const FILTER_SLIDER_SCALES = {
  price: { max: 5_000_000, step: 50_000 },
  monthlyCost: { max: 10_000, step: 100 },
  area: { max: 1_000, step: 10 },
} as const;
