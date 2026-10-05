import type { HealthStatus } from "@qa/shared";
import type { Resolvers } from "../../graphql/generated/resolvers-types.ts";

export const healthResolvers: Resolvers = {
  Query: {
    health: (): HealthStatus => ({
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
    }),
  },
};
