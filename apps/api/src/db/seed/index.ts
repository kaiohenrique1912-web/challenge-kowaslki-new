import type { Database } from "bun:sqlite";
import { rmSync } from "node:fs";
import { parseArgs } from "node:util";
import { propertyInputSchema } from "@qa/shared";
import { openDatabase, resolveDbPath } from "../client.ts";
import { recomputeDerivedFields } from "../maintenance/recompute.ts";
import { runMigrations } from "../migrate.ts";
import { type GenerateOptions, generateDataset } from "./generator.ts";
import { insertDataset, withDeferredIndexes } from "./insert.ts";

export const DEFAULT_SEED_COUNT = 60_000;
export const DEFAULT_SEED = 42;

/**
 * Popula um banco vazio (já migrado): gera, valida com as regras de packages/shared, grava e
 * recalcula os campos derivados. Lança erro se algum imóvel gerado for inválido.
 */
export function seedDatabase(db: Database, options: GenerateOptions) {
  const dataset = generateDataset(options);

  for (const property of dataset.properties) {
    const result = propertyInputSchema.safeParse(property.input);
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      throw new Error(`Imóvel gerado inválido (id ${property.id}): ${issues.join("; ")}`);
    }
  }

  withDeferredIndexes(db, () => {
    insertDataset(db, dataset);
    recomputeDerivedFields(db, options.now);
  });
  db.exec("ANALYZE;"); // estatísticas para o planner escolher bem os índices
  return dataset;
}

function removeDatabaseFiles(path: string): void {
  for (const suffix of ["", "-wal", "-shm"]) rmSync(`${path}${suffix}`, { force: true });
}

if (import.meta.main) {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      count: { type: "string", default: String(DEFAULT_SEED_COUNT) },
      seed: { type: "string", default: String(DEFAULT_SEED) },
    },
  });
  const count = Number(values.count);
  const seed = Number(values.seed);
  const path = resolveDbPath();

  const start = performance.now();
  removeDatabaseFiles(path);
  const db = openDatabase(path);
  runMigrations(db);
  seedDatabase(db, { count, seed, now: Date.now() });
  const elapsed = performance.now() - start;

  const totals = db
    .query<{ label: string; total: number }, []>(`
      SELECT 'imóveis' AS label, COUNT(*) AS total FROM properties
      UNION ALL SELECT '  ativos', COUNT(*) FROM properties WHERE status = 'ACTIVE'
      UNION ALL SELECT 'bairros', COUNT(*) FROM neighborhoods
      UNION ALL SELECT 'fotos', COUNT(*) FROM property_photos
      UNION ALL SELECT 'comodidades', COUNT(*) FROM property_amenities`)
    .all();
  const byType = db
    .query<{ type: string; total: number }, []>(
      "SELECT type, COUNT(*) AS total FROM properties GROUP BY type ORDER BY total DESC",
    )
    .all();
  db.exec("PRAGMA wal_checkpoint(TRUNCATE);");
  db.close();

  const fmt = (n: number) => n.toLocaleString("pt-BR");
  console.log(`Seed concluído em ${(elapsed / 1000).toFixed(1)} s (seed ${seed}) → ${path}`);
  for (const row of totals) console.log(`  ${row.label.padEnd(14)} ${fmt(row.total)}`);
  console.log(`  por tipo:      ${byType.map((r) => `${r.type} ${fmt(r.total)}`).join(" · ")}`);
}
