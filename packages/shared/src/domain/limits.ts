/** Faixas válidas dos campos do imóvel. Fonte: docs/business-rules.md §2.1. */

export type IntRangeLimit = { min: number; max: number };

export const PROPERTY_LIMITS = {
  salePrice: { min: 50_000, max: 50_000_000 },
  condoFee: { min: 0, max: 50_000 },
  iptu: { min: 0, max: 20_000 },
  monthlyRent: { min: 500, max: 200_000 },
  area: { min: 10, max: 2_000 },
  studioArea: { min: 10, max: 60 },
  bedrooms: { min: 0, max: 10 },
  studioBedrooms: { min: 0, max: 1 },
  bathrooms: { min: 1, max: 10 },
  parkingSpaces: { min: 0, max: 10 },
  floor: { min: 0, max: 60 },
  street: { min: 3, max: 120 },
  number: { min: 1, max: 10 },
  complement: { min: 0, max: 60 },
  description: { min: 30, max: 3_000 },
  photos: { min: 1, max: 50 },
} as const satisfies Record<string, IntRangeLimit>;

/** Retângulo do município de São Paulo (business-rules §2.1). */
export const SAO_PAULO_BOUNDS = {
  north: -23.35,
  south: -24.01,
  east: -46.36,
  west: -46.83,
} as const;

/** Praça da Sé — centro padrão do mapa e origem de "Mais próximos" sem contexto. */
export const SAO_PAULO_CENTER = { lat: -23.5505, lng: -46.6333 } as const;

/** CEPs da capital: 01000-000 a 08499-999. */
export const SAO_PAULO_CEP_RANGE = { min: 1_000_000, max: 8_499_999 } as const;

export const CITY = "São Paulo";
export const STATE = "SP";
