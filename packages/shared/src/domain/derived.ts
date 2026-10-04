/**
 * Campos derivados do imóvel — calculados, nunca informados pelo usuário.
 * Fonte: docs/business-rules.md §2.1 (derivados), §4.2 (relevância) e §5 (badges).
 */

const DAY_MS = 86_400_000;

export const PROPERTY_BADGES = [
  "EXCLUSIVE",
  "PRICE_DROP",
  "GREAT_PRICE",
  "NEW_LISTING",
  "RENTED",
] as const;
export type PropertyBadge = (typeof PROPERTY_BADGES)[number];

export const PROPERTY_BADGE_LABELS: Record<PropertyBadge, string> = {
  EXCLUSIVE: "Exclusivo",
  PRICE_DROP: "Baixou o preço",
  GREAT_PRICE: "Ótimo preço",
  NEW_LISTING: "Anúncio novo",
  RENTED: "Compre já alugado",
};

/** O card mostra no máximo este número de badges, na ordem de PROPERTY_BADGES. */
export const MAX_CARD_BADGES = 2;
export const GREAT_PRICE_RATIO = 0.85;
export const NEW_LISTING_DAYS = 7;

export function computeMonthlyCost(condoFee: number, iptu: number): number {
  return condoFee + iptu;
}

export function computePricePerM2(salePrice: number, area: number): number {
  return Math.round(salePrice / area);
}

/** Aluguel atual se o imóvel já está alugado; senão, estimativa pela mediana do bairro. */
export function computeEstimatedRent(
  input: { isRented: boolean; monthlyRent: number | null; area: number },
  medianRentPerM2: number,
): number {
  if (input.isRented && input.monthlyRent !== null) return input.monthlyRent;
  return Math.round(input.area * medianRentPerM2);
}

/** Fração mensal: 0.0045 = 0,45% a.m. */
export function computeRentalYield(estimatedRent: number, salePrice: number): number {
  return estimatedRent / salePrice;
}

export type BadgeInput = {
  isExclusive: boolean;
  isRented: boolean;
  salePrice: number;
  previousPrice: number | null;
  pricePerM2: number;
  /** epoch ms; null = nunca publicado */
  publishedAt: number | null;
};

/** Todos os badges aplicáveis, em ordem de prioridade. */
export function computeBadges(
  input: BadgeInput,
  neighborhoodMedianPricePerM2: number,
  now: number,
): PropertyBadge[] {
  const badges: PropertyBadge[] = [];
  if (input.isExclusive) badges.push("EXCLUSIVE");
  if (input.previousPrice !== null && input.previousPrice > input.salePrice) {
    badges.push("PRICE_DROP");
  }
  if (
    neighborhoodMedianPricePerM2 > 0 &&
    input.pricePerM2 <= GREAT_PRICE_RATIO * neighborhoodMedianPricePerM2
  ) {
    badges.push("GREAT_PRICE");
  }
  if (input.publishedAt !== null && now - input.publishedAt <= NEW_LISTING_DAYS * DAY_MS) {
    badges.push("NEW_LISTING");
  }
  if (input.isRented) badges.push("RENTED");
  return badges;
}

export type RelevanceInput = {
  photoCount: number;
  descriptionLength: number;
  isExclusive: boolean;
  publishedAt: number | null;
  badges: readonly PropertyBadge[];
};

/** 0–100. Fórmula em business-rules §4.2. */
export function computeRelevanceScore(input: RelevanceInput, now: number): number {
  const photos = 30 * (Math.min(input.photoCount, 15) / 15);
  const description = input.descriptionLength >= 300 ? 20 : 0;
  const exclusive = input.isExclusive ? 20 : 0;
  const daysSincePublished =
    input.publishedAt === null ? Number.POSITIVE_INFINITY : (now - input.publishedAt) / DAY_MS;
  const recency = 20 * Math.max(0, 1 - daysSincePublished / 90);
  const priceBadge =
    input.badges.includes("PRICE_DROP") || input.badges.includes("GREAT_PRICE") ? 10 : 0;
  return Math.round((photos + description + exclusive + recency + priceBadge) * 100) / 100;
}

/** Mediana de uma lista de números (0 para lista vazia). */
export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] as number;
  return Math.round(((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2);
}
