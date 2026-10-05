import type { Database } from "bun:sqlite";
import {
  type NeighborhoodRecord,
  type NeighborhoodRow,
  toNeighborhoodRecord,
} from "./neighborhood-record.ts";

const COLUMNS = `id, slug, name, zone, center_lat, center_lng, north, south, east, west,
  median_price_per_m2, median_rent_per_m2`;
const placeholders = (count: number) => Array.from({ length: count }, () => "?").join(", ");

export function findAllNeighborhoods(db: Database): NeighborhoodRecord[] {
  return db
    .query<NeighborhoodRow, []>(`SELECT ${COLUMNS} FROM neighborhoods ORDER BY name_normalized`)
    .all()
    .map(toNeighborhoodRecord);
}

export function findNeighborhoodsByIds(db: Database, ids: readonly number[]): NeighborhoodRecord[] {
  if (ids.length === 0) return [];
  return db
    .query<NeighborhoodRow, number[]>(
      `SELECT ${COLUMNS} FROM neighborhoods WHERE id IN (${placeholders(ids.length)})`,
    )
    .all(...ids)
    .map(toNeighborhoodRecord);
}

export function findNeighborhoodsBySlugs(
  db: Database,
  slugs: readonly string[],
): NeighborhoodRecord[] {
  if (slugs.length === 0) return [];
  return db
    .query<NeighborhoodRow, string[]>(
      `SELECT ${COLUMNS} FROM neighborhoods WHERE slug IN (${placeholders(slugs.length)})`,
    )
    .all(...slugs)
    .map(toNeighborhoodRecord);
}

/** Bairros cujo nome normalizado contém o termo; quem começa com o termo vem primeiro. */
export function searchNeighborhoodsByName(
  db: Database,
  normalizedTerm: string,
  limit: number,
): NeighborhoodRecord[] {
  const escaped = escapeLike(normalizedTerm);
  return db
    .query<NeighborhoodRow, [string, string, number]>(`
      SELECT ${COLUMNS} FROM neighborhoods
      WHERE name_normalized LIKE ? ESCAPE '\\'
      ORDER BY CASE WHEN name_normalized LIKE ? ESCAPE '\\' THEN 0 ELSE 1 END, name_normalized
      LIMIT ?`)
    .all(`%${escaped}%`, `${escaped}%`, limit)
    .map(toNeighborhoodRecord);
}

export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}
