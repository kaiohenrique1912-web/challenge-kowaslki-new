import type { Zone } from "@qa/shared";

/** Bairro como sai do repositório. É o "parent" dos resolvers de `Neighborhood`. */
export type NeighborhoodRecord = {
  id: number;
  slug: string;
  name: string;
  zone: Zone;
  centerLat: number;
  centerLng: number;
  north: number;
  south: number;
  east: number;
  west: number;
  medianPricePerM2: number;
  medianRentPerM2: number;
};

export type NeighborhoodRow = {
  id: number;
  slug: string;
  name: string;
  zone: Zone;
  center_lat: number;
  center_lng: number;
  north: number;
  south: number;
  east: number;
  west: number;
  median_price_per_m2: number;
  median_rent_per_m2: number;
};

export function toNeighborhoodRecord(row: NeighborhoodRow): NeighborhoodRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    zone: row.zone,
    centerLat: row.center_lat,
    centerLng: row.center_lng,
    north: row.north,
    south: row.south,
    east: row.east,
    west: row.west,
    medianPricePerM2: row.median_price_per_m2,
    medianRentPerM2: row.median_rent_per_m2,
  };
}
