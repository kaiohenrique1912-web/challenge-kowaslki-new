import type { Database } from "bun:sqlite";
import { escapeLike } from "../neighborhoods/neighborhoods.repository.ts";

export type StreetMatchRow = {
  street: string;
  neighborhood_slug: string;
  neighborhood_name: string;
  lat: number;
  lng: number;
  south: number;
  north: number;
  west: number;
  east: number;
  total: number;
};

/** Máximo de nomes de rua distintos considerados por busca (termos genéricos como "rua"). */
const MAX_STREET_NAMES = 30;

/**
 * Ruas com imóveis ativos cujo nome normalizado contém o termo, agrupadas por bairro.
 * Dois passos: (1) nomes distintos pelo índice `idx_prop_street` (só o índice, rápido);
 * (2) agrupa apenas essas ruas — evita varrer a tabela inteira com LIKE '%termo%'.
 */
export function searchStreets(
  db: Database,
  normalizedTerm: string,
  limit: number,
): StreetMatchRow[] {
  const names = db
    .query<{ name: string }, [string, number]>(`
      SELECT DISTINCT street_normalized AS name FROM properties
      WHERE street_normalized LIKE ? ESCAPE '\\'
      LIMIT ?`)
    .all(`%${escapeLike(normalizedTerm)}%`, MAX_STREET_NAMES)
    .map((r) => r.name);
  if (names.length === 0) return [];

  return db
    .query<StreetMatchRow, (string | number)[]>(`
      SELECT p.street, n.slug AS neighborhood_slug, n.name AS neighborhood_name,
        AVG(p.lat) AS lat, AVG(p.lng) AS lng,
        MIN(p.lat) AS south, MAX(p.lat) AS north, MIN(p.lng) AS west, MAX(p.lng) AS east,
        COUNT(*) AS total
      FROM properties p JOIN neighborhoods n ON n.id = p.neighborhood_id
      WHERE p.status = 'ACTIVE' AND p.street_normalized IN (${names.map(() => "?").join(", ")})
      GROUP BY p.street_normalized, p.neighborhood_id
      ORDER BY total DESC
      LIMIT ?`)
    .all(...names, limit);
}
