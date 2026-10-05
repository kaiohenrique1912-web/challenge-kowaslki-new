import type { Resolvers } from "../../graphql/generated/resolvers-types.ts";
import { suggestLocations } from "./locations.service.ts";

export const locationsResolvers: Resolvers = {
  Query: {
    locationSuggestions: (_, args, ctx) => suggestLocations(ctx, args),
  },
};
