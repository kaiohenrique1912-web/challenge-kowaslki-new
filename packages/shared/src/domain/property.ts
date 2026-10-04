/** Enums e rótulos do imóvel. Fonte: docs/business-rules.md §2.1. */

export const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "CONDO_HOUSE", "STUDIO"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  APARTMENT: "Apartamento",
  HOUSE: "Casa",
  CONDO_HOUSE: "Casa de condomínio",
  STUDIO: "Studio",
};

/** Plural usado no cabeçalho da lista (business-rules §6.3). */
export const PROPERTY_TYPE_PLURAL_LABELS: Record<PropertyType, string> = {
  APARTMENT: "Apartamentos",
  HOUSE: "Casas",
  CONDO_HOUSE: "Casas de condomínio",
  STUDIO: "Studios",
};

/** Rótulo do filtro "Tipos de imóvel" (igual ao original). */
export const PROPERTY_TYPE_FILTER_LABELS: Record<PropertyType, string> = {
  APARTMENT: "Apartamento",
  HOUSE: "Casa",
  CONDO_HOUSE: "Casa de Condomínio",
  STUDIO: "Kitnet/Studio",
};

export const PROPERTY_STATUSES = ["DRAFT", "ACTIVE", "INACTIVE"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

/** Tipos que ficam dentro de um condomínio (têm condomínio e andar/áreas comuns). */
export const CONDOMINIUM_TYPES: readonly PropertyType[] = ["APARTMENT", "STUDIO", "CONDO_HOUSE"];

/** Tipos que têm andar. */
export const TYPES_WITH_FLOOR: readonly PropertyType[] = ["APARTMENT", "STUDIO"];

/** O código público começa aqui (business-rules §2.1). */
export const FIRST_PROPERTY_ID = 1_000_000;

export const ZONES = ["CENTRO", "OESTE", "SUL", "NORTE", "LESTE"] as const;
export type Zone = (typeof ZONES)[number];

export const ZONE_LABELS: Record<Zone, string> = {
  CENTRO: "Centro",
  OESTE: "Zona Oeste",
  SUL: "Zona Sul",
  NORTE: "Zona Norte",
  LESTE: "Zona Leste",
};
