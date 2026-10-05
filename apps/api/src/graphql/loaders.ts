import type { Database } from "bun:sqlite";
import type { AmenityCode } from "@qa/shared";
import DataLoader from "dataloader";
import type { NeighborhoodRecord } from "../modules/neighborhoods/neighborhood-record.ts";
import { findNeighborhoodsByIds } from "../modules/neighborhoods/neighborhoods.repository.ts";
import {
  findAmenitiesByPropertyIds,
  findFavoritePropertyIds,
  findPhotosByPropertyIds,
  type PhotoRecord,
} from "../modules/properties/properties.repository.ts";

/**
 * Loaders por request (padrão DataLoader): juntam os pedidos de vários imóveis da mesma
 * resposta numa única consulta — evita N+1 ao listar 24 cards.
 */
export function createLoaders(db: Database, userId: string | null) {
  return {
    neighborhoodById: new DataLoader<number, NeighborhoodRecord>(async (ids) => {
      const byId = new Map(findNeighborhoodsByIds(db, ids).map((n) => [n.id, n]));
      return ids.map((id) => byId.get(id) ?? new Error(`Bairro ${id} não encontrado`));
    }),

    photosByPropertyId: new DataLoader<number, PhotoRecord[]>(async (ids) => {
      const grouped = groupBy(findPhotosByPropertyIds(db, ids), (p) => p.propertyId);
      return ids.map((id) => grouped.get(id) ?? []);
    }),

    amenitiesByPropertyId: new DataLoader<number, AmenityCode[]>(async (ids) => {
      const grouped = groupBy(findAmenitiesByPropertyIds(db, ids), (a) => a.propertyId);
      return ids.map((id) => (grouped.get(id) ?? []).map((a) => a.code));
    }),

    isFavorite: new DataLoader<number, boolean>(async (ids) => {
      if (!userId) return ids.map(() => false);
      const favorites = new Set(findFavoritePropertyIds(db, userId, ids));
      return ids.map((id) => favorites.has(id));
    }),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;

function groupBy<T, K>(items: readonly T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = map.get(k);
    if (list) list.push(item);
    else map.set(k, [item]);
  }
  return map;
}
