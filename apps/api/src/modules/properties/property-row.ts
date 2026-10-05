import type { SQLQueryBindings } from "bun:sqlite";
import { normalizeText, type PropertyInput, type PropertyStatus } from "@qa/shared";

/**
 * ÚNICO mapeamento `PropertyInput` (o que um formulário envia, validado por
 * `propertyInputSchema`) → colunas da tabela `properties`. Usado pelo seed e por qualquer feature
 * que grave imóveis (cadastro, edição): não repita a lista de colunas em outro lugar.
 * `price_per_m2` e `monthly_cost` são colunas geradas pelo SQLite; `estimated_rent` e
 * `relevance_score` vêm de `recomputeDerivedFields` (db/maintenance/recompute.ts).
 */

export const PROPERTY_COLUMNS = [
  "id",
  "status",
  "type",
  "cep",
  "street",
  "street_normalized",
  "number",
  "complement",
  "neighborhood_id",
  "lat",
  "lng",
  "sale_price",
  "previous_price",
  "condo_fee",
  "iptu",
  "area",
  "bedrooms",
  "suites",
  "bathrooms",
  "parking_spaces",
  "floor",
  "is_furnished",
  "accepts_pets",
  "near_subway",
  "is_exclusive",
  "is_rented",
  "monthly_rent",
  "estimated_rent",
  "description",
  "photo_count",
  "published_at",
  "created_at",
  "updated_at",
] as const;

/** O que não vem do formulário: id, status, histórico de preço e datas. */
export type PropertyRowMeta = {
  id: number;
  status: PropertyStatus;
  previousPrice: number | null;
  /** Provisório até o próximo `recomputeDerivedFields` (use 0 num cadastro novo). */
  estimatedRent: number;
  /** null enquanto o imóvel não foi publicado (rascunho). */
  publishedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

/** Valores na ordem de `PROPERTY_COLUMNS`. */
export function toPropertyRow(input: PropertyInput, meta: PropertyRowMeta): SQLQueryBindings[] {
  return [
    meta.id,
    meta.status,
    input.type,
    input.cep,
    input.street,
    normalizeText(input.street),
    input.number,
    input.complement,
    input.neighborhoodId,
    input.latitude,
    input.longitude,
    input.salePrice,
    meta.previousPrice,
    input.condoFee,
    input.iptu,
    input.area,
    input.bedrooms,
    input.suites,
    input.bathrooms,
    input.parkingSpaces,
    input.floor,
    input.isFurnished ? 1 : 0,
    input.acceptsPets ? 1 : 0,
    input.nearSubway ? 1 : 0,
    input.isExclusive ? 1 : 0,
    input.isRented ? 1 : 0,
    input.monthlyRent,
    meta.estimatedRent,
    input.description,
    input.photos.length,
    meta.publishedAt,
    meta.createdAt,
    meta.updatedAt,
  ];
}

/** Linhas de `property_photos` (posição = ordem do formulário; a 0 é a capa). */
export const toPhotoRows = (id: number, photos: readonly string[]): SQLQueryBindings[][] =>
  photos.map((url, position) => [id, position, url]);

/** Linhas de `property_amenities`. */
export const toAmenityRows = (id: number, amenities: readonly string[]): SQLQueryBindings[][] =>
  amenities.map((code) => [id, code]);
