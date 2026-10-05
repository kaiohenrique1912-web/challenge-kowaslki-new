import {
  type BoundingBox,
  CITY,
  type LatLng,
  LOCATION_SUGGESTIONS,
  locationSuggestionsArgsSchema,
  normalizeText,
  STATE,
} from "@qa/shared";
import type { GraphQLContext } from "../../context.ts";
import { parseOrThrow } from "../../graphql/errors.ts";
import {
  findNeighborhoodsByIds,
  searchNeighborhoodsByName,
} from "../neighborhoods/neighborhoods.repository.ts";
import { findActivePropertyById } from "../properties/properties.repository.ts";
import { searchStreets } from "./locations.repository.ts";

export type LocationSuggestionModel = {
  kind: "NEIGHBORHOOD" | "STREET" | "PROPERTY_CODE";
  label: string;
  neighborhoodSlug: string | null;
  propertyId: string | null;
  center: LatLng;
  bounds: BoundingBox | null;
};

/**
 * Autocomplete "Rua, bairro ou código": código do imóvel (só dígitos) → bairros → ruas.
 */
export function suggestLocations(ctx: GraphQLContext, rawArgs: unknown): LocationSuggestionModel[] {
  const args = parseOrThrow(locationSuggestionsArgsSchema, rawArgs);
  const limit = args.limit ?? LOCATION_SUGGESTIONS.defaultLimit;
  const term = normalizeText(args.query);
  const suggestions: LocationSuggestionModel[] = [];

  if (/^\d+$/.test(term)) {
    const property = findActivePropertyById(ctx.db, Number(term));
    const neighborhood = property
      ? findNeighborhoodsByIds(ctx.db, [property.neighborhoodId])[0]
      : undefined;
    if (property && neighborhood) {
      suggestions.push({
        kind: "PROPERTY_CODE",
        label: `Imóvel ${property.id} — ${property.street}, ${neighborhood.name}`,
        neighborhoodSlug: neighborhood.slug,
        propertyId: String(property.id),
        center: { lat: property.lat, lng: property.lng },
        bounds: null,
      });
    }
    return suggestions;
  }

  for (const n of searchNeighborhoodsByName(ctx.db, term, limit)) {
    suggestions.push({
      kind: "NEIGHBORHOOD",
      label: `${n.name}, ${CITY} – ${STATE}`,
      neighborhoodSlug: n.slug,
      propertyId: null,
      center: { lat: n.centerLat, lng: n.centerLng },
      bounds: { north: n.north, south: n.south, east: n.east, west: n.west },
    });
  }

  const remaining = limit - suggestions.length;
  if (remaining > 0) {
    for (const s of searchStreets(ctx.db, term, remaining)) {
      suggestions.push({
        kind: "STREET",
        label: `${s.street}, ${s.neighborhood_name} – ${CITY}`,
        neighborhoodSlug: s.neighborhood_slug,
        propertyId: null,
        center: { lat: s.lat, lng: s.lng },
        bounds: { north: s.north, south: s.south, east: s.east, west: s.west },
      });
    }
  }
  return suggestions;
}
