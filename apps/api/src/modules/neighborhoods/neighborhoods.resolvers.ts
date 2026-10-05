import type { Resolvers } from "../../graphql/generated/resolvers-types.ts";
import { findAllNeighborhoods } from "./neighborhoods.repository.ts";

export const neighborhoodsResolvers: Resolvers = {
  Query: {
    neighborhoods: (_, __, ctx) => findAllNeighborhoods(ctx.db),
  },
  Neighborhood: {
    id: (n) => String(n.id),
    center: (n) => ({ lat: n.centerLat, lng: n.centerLng }),
    bounds: (n) => ({ north: n.north, south: n.south, east: n.east, west: n.west }),
  },
};
