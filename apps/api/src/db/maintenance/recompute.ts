import type { Database } from "bun:sqlite";
import { computeBadges, computeEstimatedRent, computeRelevanceScore, median } from "@qa/shared";
import { openDatabase } from "../client.ts";

type PropertyRow = {
  id: number;
  status: string;
  neighborhood_id: number;
  area: number;
  sale_price: number;
  previous_price: number | null;
  price_per_m2: number;
  is_exclusive: number;
  is_rented: number;
  monthly_rent: number | null;
  photo_count: number;
  description_length: number;
  published_at: number | null;
};

/**
 * Recalcula os campos derivados que dependem de outros imóveis ou do tempo
 * (business-rules §2.1, §4.2 e §7):
 * 1. `median_price_per_m2` de cada bairro (só imóveis ACTIVE);
 * 2. `estimated_rent` e `relevance_score` de cada imóvel.
 * Rodar após o seed, após cadastros/edições e diariamente (a relevância decai com o tempo).
 */
export function recomputeDerivedFields(db: Database, now: number = Date.now()) {
  const rows = db
    .query<PropertyRow, []>(`
      SELECT id, status, neighborhood_id, area, sale_price, previous_price, price_per_m2,
        is_exclusive, is_rented, monthly_rent, photo_count, length(description) AS description_length,
        published_at
      FROM properties`)
    .all();

  const pricesByNeighborhood = new Map<number, number[]>();
  for (const row of rows) {
    if (row.status !== "ACTIVE") continue;
    const list = pricesByNeighborhood.get(row.neighborhood_id) ?? [];
    list.push(row.price_per_m2);
    pricesByNeighborhood.set(row.neighborhood_id, list);
  }

  const neighborhoods = db
    .query<{ id: number; median_rent_per_m2: number }, []>(
      "SELECT id, median_rent_per_m2 FROM neighborhoods",
    )
    .all();
  const medianPriceById = new Map<number, number>();
  const rentById = new Map<number, number>();
  for (const n of neighborhoods) {
    medianPriceById.set(n.id, median(pricesByNeighborhood.get(n.id) ?? []));
    rentById.set(n.id, n.median_rent_per_m2);
  }

  const updateNeighborhood = db.query(
    "UPDATE neighborhoods SET median_price_per_m2 = ? WHERE id = ?",
  );
  const updateProperty = db.query(
    "UPDATE properties SET estimated_rent = ?, relevance_score = ? WHERE id = ?",
  );

  db.transaction(() => {
    for (const [id, value] of medianPriceById) updateNeighborhood.run(value, id);

    for (const row of rows) {
      const isRented = row.is_rented === 1;
      const isExclusive = row.is_exclusive === 1;
      const estimatedRent = computeEstimatedRent(
        { isRented, monthlyRent: row.monthly_rent, area: row.area },
        rentById.get(row.neighborhood_id) ?? 0,
      );
      const badges = computeBadges(
        {
          isExclusive,
          isRented,
          salePrice: row.sale_price,
          previousPrice: row.previous_price,
          pricePerM2: row.price_per_m2,
          publishedAt: row.published_at,
        },
        medianPriceById.get(row.neighborhood_id) ?? 0,
        now,
      );
      const relevance = computeRelevanceScore(
        {
          photoCount: row.photo_count,
          descriptionLength: row.description_length,
          isExclusive,
          publishedAt: row.published_at,
          badges,
        },
        now,
      );
      updateProperty.run(estimatedRent, relevance, row.id);
    }
  })();

  return { neighborhoods: neighborhoods.length, properties: rows.length };
}

if (import.meta.main) {
  const start = performance.now();
  const db = openDatabase();
  const result = recomputeDerivedFields(db);
  db.close();
  console.log(
    `Recalculados ${result.properties.toLocaleString("pt-BR")} imóveis e ${result.neighborhoods} bairros em ${Math.round(performance.now() - start)} ms.`,
  );
}
