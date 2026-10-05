import { GraphQLScalarType } from "graphql";
import { favoritesResolvers } from "../modules/favorites/favorites.resolvers.ts";
import { healthResolvers } from "../modules/health/health.resolvers.ts";
import { locationsResolvers } from "../modules/locations/locations.resolvers.ts";
import { neighborhoodsResolvers } from "../modules/neighborhoods/neighborhoods.resolvers.ts";
import { propertiesResolvers } from "../modules/properties/properties.resolvers.ts";
import type { Resolvers } from "./generated/resolvers-types.ts";
import { DateTimeScalar } from "./scalars.ts";

/** Resolvers de todos os módulos. Ao criar um módulo novo, adicione-o aqui. */
const modules: Resolvers[] = [
  { DateTime: DateTimeScalar },
  healthResolvers,
  propertiesResolvers,
  neighborhoodsResolvers,
  locationsResolvers,
  favoritesResolvers,
];

/** Junta os resolvers dos módulos, mesclando tipos repetidos (ex.: `Query`). */
function mergeResolvers(maps: Resolvers[]): Resolvers {
  const merged: Record<string, unknown> = {};
  for (const map of maps) {
    for (const [typeName, value] of Object.entries(map)) {
      const current = merged[typeName];
      const isFieldMap =
        typeof value === "object" && value !== null && !(value instanceof GraphQLScalarType);
      merged[typeName] =
        isFieldMap && typeof current === "object" && current !== null
          ? { ...current, ...value }
          : value;
    }
  }
  return merged as Resolvers;
}

export const resolvers = mergeResolvers(modules);
