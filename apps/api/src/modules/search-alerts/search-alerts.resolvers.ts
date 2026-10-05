import type { Resolvers } from "../../graphql/generated/resolvers-types.ts";
import { createSearchAlert, searchAlerts } from "./search-alerts.service.ts";

export const searchAlertsResolvers: Resolvers = {
  Query: {
    searchAlerts: (_, __, ctx) => searchAlerts(ctx),
  },
  Mutation: {
    createSearchAlert: (_, { input }, ctx) => createSearchAlert(ctx, input),
  },
  SearchAlert: {
    id: (alert) => String(alert.id),
  },
};
