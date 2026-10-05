import { z } from "zod";
import { AMENITY_CODES } from "../domain/amenities.ts";
import { DRAWN_AREA } from "../domain/drawn-area.ts";
import { MAP_ZOOM } from "../domain/map-grid.ts";
import { PROPERTY_TYPES } from "../domain/property.ts";
import {
  LOCATION_SUGGESTIONS,
  MAX_NEIGHBORHOOD_FILTER,
  MIN_COUNT_FILTER_MAX,
  PUBLISHED_WITHIN,
  SEARCH_PAGE_SIZE,
  SORT_ORDERS,
} from "../domain/search.ts";

/**
 * Validação dos argumentos da busca (docs/business-rules.md §4.1). Os campos aceitam `null`
 * porque é assim que o GraphQL entrega argumentos omitidos.
 */

const rangeSchema = (label: string) =>
  z
    .object({
      min: z.number().int().min(0, `${label}: o mínimo não pode ser negativo.`).nullish(),
      max: z.number().int().min(0, `${label}: o máximo não pode ser negativo.`).nullish(),
    })
    .refine((r) => r.min == null || r.max == null || r.min <= r.max, {
      message: `${label}: o valor mínimo não pode ser maior que o máximo.`,
    })
    .nullish();

const minCount = (label: string, max: number) =>
  z
    .number()
    .int()
    .min(1, `${label}: use um valor de 1 a ${max}.`)
    .max(max, `${label}: use um valor de 1 a ${max}.`)
    .nullish();

export const boundingBoxSchema = z
  .object({
    north: z.number().min(-90).max(90),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    west: z.number().min(-180).max(180),
  })
  .refine((b) => b.north > b.south, {
    message: "Área do mapa inválida: norte deve ser maior que sul.",
  })
  .refine((b) => b.east > b.west, {
    message: "Área do mapa inválida: leste deve ser maior que oeste.",
  });

export const latLngSchema = z.object({
  lat: z.number().min(-90, "Latitude inválida.").max(90, "Latitude inválida."),
  lng: z.number().min(-180, "Longitude inválida.").max(180, "Longitude inválida."),
});

export const searchFiltersSchema = z
  .object({
    neighborhoodSlugs: z
      .array(z.string().regex(/^[a-z0-9-]+$/, "Bairro inválido."))
      .max(MAX_NEIGHBORHOOD_FILTER, `Selecione no máximo ${MAX_NEIGHBORHOOD_FILTER} bairros.`)
      .nullish(),
    bbox: boundingBoxSchema.nullish(),
    polygon: z
      .array(latLngSchema)
      .min(
        DRAWN_AREA.minPoints,
        `Área desenhada: use de ${DRAWN_AREA.minPoints} a ${DRAWN_AREA.maxPoints} pontos.`,
      )
      .max(
        DRAWN_AREA.maxPoints,
        `Área desenhada: use de ${DRAWN_AREA.minPoints} a ${DRAWN_AREA.maxPoints} pontos.`,
      )
      .nullish(),
    types: z.array(z.enum(PROPERTY_TYPES)).nullish(),
    price: rangeSchema("Valor do imóvel"),
    monthlyCost: rangeSchema("Condomínio + IPTU"),
    area: rangeSchema("Área"),
    minBedrooms: minCount("Quartos", MIN_COUNT_FILTER_MAX.bedrooms),
    minBathrooms: minCount("Banheiros", MIN_COUNT_FILTER_MAX.bathrooms),
    minSuites: minCount("Suítes", MIN_COUNT_FILTER_MAX.suites),
    minParkingSpaces: minCount("Vagas", MIN_COUNT_FILTER_MAX.parkingSpaces),
    publishedWithin: z.enum(PUBLISHED_WITHIN).nullish(),
    furnished: z.boolean().nullish(),
    nearSubway: z.boolean().nullish(),
    exclusive: z.boolean().nullish(),
    rented: z.boolean().nullish(),
    amenities: z
      .array(z.enum(AMENITY_CODES))
      .refine((list) => new Set(list).size === list.length, "Comodidades repetidas.")
      .nullish(),
    onlyFavorites: z.boolean().nullish(),
  })
  .strict();

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

export const searchArgsSchema = z.object({
  filters: searchFiltersSchema.nullish(),
  sort: z.enum(SORT_ORDERS).nullish(),
  origin: latLngSchema.nullish(),
  first: z
    .number()
    .int()
    .min(0, `Use de 0 a ${SEARCH_PAGE_SIZE.max} resultados por página.`)
    .max(SEARCH_PAGE_SIZE.max, `Use de 0 a ${SEARCH_PAGE_SIZE.max} resultados por página.`)
    .nullish(),
  after: z.string().max(500).nullish(),
});

export type SearchArgs = z.infer<typeof searchArgsSchema>;

export const mapClustersArgsSchema = z.object({
  filters: searchFiltersSchema.nullish(),
  bbox: boundingBoxSchema,
  zoom: z
    .number()
    .int("Zoom deve ser inteiro.")
    .min(MAP_ZOOM.min, `Zoom deve ficar entre ${MAP_ZOOM.min} e ${MAP_ZOOM.max}.`)
    .max(MAP_ZOOM.max, `Zoom deve ficar entre ${MAP_ZOOM.min} e ${MAP_ZOOM.max}.`),
});

export const locationSuggestionsArgsSchema = z.object({
  query: z
    .string()
    .trim()
    .min(
      LOCATION_SUGGESTIONS.minQueryLength,
      `Digite pelo menos ${LOCATION_SUGGESTIONS.minQueryLength} caracteres.`,
    )
    .max(100),
  limit: z.number().int().min(1).max(LOCATION_SUGGESTIONS.maxLimit).nullish(),
});
