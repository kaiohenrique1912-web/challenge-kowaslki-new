import type { HealthStatus } from "@qa/shared";

export const healthResolvers = {
  Query: {
    health: (): HealthStatus => ({
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
    }),
  },
};
