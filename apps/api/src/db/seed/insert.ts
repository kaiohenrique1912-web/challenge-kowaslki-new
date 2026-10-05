import type { Database, SQLQueryBindings } from "bun:sqlite";
import {
  PROPERTY_COLUMNS,
  toAmenityRows,
  toPhotoRows,
  toPropertyRow,
} from "../../modules/properties/property-row.ts";
import type { Dataset } from "./generator.ts";

type Row = SQLQueryBindings[];

/**
 * Insere linhas em lotes de `INSERT … VALUES (…), (…), …` — bem mais rápido que uma linha por
 * comando para milhões de linhas. Deve rodar dentro de uma transação.
 */
function bulkInsert(db: Database, table: string, columns: string[], rows: Row[]): void {
  // Limite de parâmetros por comando do SQLite é 32766; fica bem abaixo.
  const rowsPerStatement = Math.max(1, Math.floor(8_000 / columns.length));
  const placeholders = (n: number) =>
    Array.from({ length: n }, () => `(${columns.map(() => "?").join(", ")})`).join(", ");
  const sql = (n: number) =>
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders(n)}`;

  const full = db.query(sql(rowsPerStatement));
  let offset = 0;
  for (; offset + rowsPerStatement <= rows.length; offset += rowsPerStatement) {
    full.run(...rows.slice(offset, offset + rowsPerStatement).flat());
  }
  const rest = rows.slice(offset);
  if (rest.length > 0) db.query(sql(rest.length)).run(...rest.flat());
}

/**
 * Remove os índices secundários (`idx_*`), executa `fn` e recria os índices no fim. Em cargas
 * grandes é muito mais rápido criar o índice uma vez do que atualizá-lo a cada linha.
 */
export function withDeferredIndexes<T>(db: Database, fn: () => T): T {
  const indexes = db
    .query<{ name: string; sql: string }, []>(
      "SELECT name, sql FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%'",
    )
    .all();
  for (const index of indexes) db.exec(`DROP INDEX ${index.name}`);
  try {
    return fn();
  } finally {
    for (const index of indexes) db.exec(index.sql);
  }
}

/** Grava bairros, imóveis, fotos e comodidades numa única transação (rápido e atômico). */
export function insertDataset(db: Database, { neighborhoods, properties }: Dataset): void {
  const neighborhoodRows: Row[] = neighborhoods.map((n) => [
    n.id,
    n.slug,
    n.name,
    n.nameNormalized,
    n.zone,
    n.centerLat,
    n.centerLng,
    n.north,
    n.south,
    n.east,
    n.west,
    n.medianRentPerM2,
  ]);

  const propertyRows: Row[] = [];
  const photoRows: Row[] = [];
  const amenityRows: Row[] = [];
  for (const p of properties) {
    propertyRows.push(toPropertyRow(p.input, p));
    photoRows.push(...toPhotoRows(p.id, p.input.photos));
    amenityRows.push(...toAmenityRows(p.id, p.input.amenities));
  }

  db.transaction(() => {
    bulkInsert(
      db,
      "neighborhoods",
      [
        "id",
        "slug",
        "name",
        "name_normalized",
        "zone",
        "center_lat",
        "center_lng",
        "north",
        "south",
        "east",
        "west",
        "median_rent_per_m2",
      ],
      neighborhoodRows,
    );
    bulkInsert(db, "properties", [...PROPERTY_COLUMNS], propertyRows);
    bulkInsert(db, "property_photos", ["property_id", "position", "url"], photoRows);
    bulkInsert(db, "property_amenities", ["property_id", "amenity_code"], amenityRows);
  })();
}
