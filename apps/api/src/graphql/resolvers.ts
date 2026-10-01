import { healthResolvers } from "../modules/health/health.resolvers.ts";

type ResolverMap = Record<string, Record<string, unknown>>;

/** Junta os resolvers de vários módulos, mesclando tipos repetidos (ex.: `Query`). */
function mergeResolvers(...maps: ResolverMap[]): ResolverMap {
  const merged: ResolverMap = {};
  for (const map of maps) {
    for (const [typeName, fields] of Object.entries(map)) {
      merged[typeName] = { ...merged[typeName], ...fields };
    }
  }
  return merged;
}

/** Resolvers de todos os módulos. Ao criar um módulo novo, adicione-o aqui. */
export const resolvers = mergeResolvers(healthResolvers);
