import type { Resolvers } from "../../graphql/generated/resolvers-types.ts";
import { addFavorite, favoritesCount, removeFavorite } from "./favorites.service.ts";

export const favoritesResolvers: Resolvers = {
  Query: {
    favoritesCount: (_, __, ctx) => favoritesCount(ctx),
  },
  Mutation: {
    addFavorite: (_, { propertyId }, ctx) => addFavorite(ctx, propertyId),
    removeFavorite: (_, { propertyId }, ctx) => removeFavorite(ctx, propertyId),
  },
};
