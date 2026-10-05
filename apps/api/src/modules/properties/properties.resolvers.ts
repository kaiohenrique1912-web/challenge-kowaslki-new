import {
  AMENITIES,
  computeBadges,
  getAmenity,
  getApplicableAmenities,
  PROPERTY_LIMITS,
  propertyHeadline,
  propertyTitle,
} from "@qa/shared";
import type { Resolvers } from "../../graphql/generated/resolvers-types.ts";
import { getMapClusters, getPropertyById, searchProperties } from "./properties.service.ts";

/** Resolvers finos: delegam ao serviço e só montam campos derivados para exibição. */
export const propertiesResolvers: Resolvers = {
  Query: {
    searchProperties: (_, args, ctx) => searchProperties(ctx, args),
    property: (_, { id }, ctx) => getPropertyById(ctx, id),
    propertyMapClusters: (_, args, ctx) => getMapClusters(ctx, args),
    amenities: () => [...AMENITIES],
  },

  PropertyConnection: {
    totalCount: (parent) => parent.countTotal(),
  },

  Property: {
    id: (p) => String(p.id),
    title: async (p, _, ctx) => {
      const neighborhood = await ctx.loaders.neighborhoodById.load(p.neighborhoodId);
      return propertyTitle({
        type: p.type,
        bedrooms: p.bedrooms,
        neighborhoodName: neighborhood.name,
      });
    },
    headline: (p) => propertyHeadline(p),
    neighborhood: (p, _, ctx) => ctx.loaders.neighborhoodById.load(p.neighborhoodId),
    location: (p) => ({ lat: p.lat, lng: p.lng }),
    amenities: async (p, _, ctx) => {
      const codes = await ctx.loaders.amenitiesByPropertyId.load(p.id);
      const owned = new Set(codes);
      // Na ordem do catálogo (= ordem do painel de filtros).
      return AMENITIES.filter((a) => owned.has(a.code));
    },
    unavailableAmenities: async (p, _, ctx) => {
      const owned = new Set(await ctx.loaders.amenitiesByPropertyId.load(p.id));
      return getApplicableAmenities(p.type)
        .filter((code) => !owned.has(code))
        .map(getAmenity);
    },
    photos: async (p, { limit }, ctx) => {
      const photos = await ctx.loaders.photosByPropertyId.load(p.id);
      const max = Math.min(
        Math.max(limit ?? PROPERTY_LIMITS.photos.max, 0),
        PROPERTY_LIMITS.photos.max,
      );
      return photos.slice(0, max);
    },
    badges: async (p, _, ctx) => {
      const neighborhood = await ctx.loaders.neighborhoodById.load(p.neighborhoodId);
      return computeBadges(p, neighborhood.medianPricePerM2, ctx.now);
    },
    isFavorite: (p, _, ctx) => ctx.loaders.isFavorite.load(p.id),
  },
};
