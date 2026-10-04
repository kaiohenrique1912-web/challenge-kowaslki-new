import type { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { openDatabase, resolveDbPath } from "./client.ts";

const MIGRATIONS_DIR = join(import.meta.dir, "migrations");

/**
 * Aplica, em ordem, os arquivos `migrations/NNNN_nome.sql` ainda não aplicados e os registra
 * em `schema_migrations`. Retorna os nomes aplicados nesta execução.
 */
export function runMigrations(db: Database): string[] {
  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)",
  );
  const applied = new Set(
    db
      .query<{ name: string }, []>("SELECT name FROM schema_migrations")
      .all()
      .map((row) => row.name),
  );
  const pending = readdirSync(MIGRATIONS_DIR)
    .filter((file) => /^\d{4}_.+\.sql$/.test(file) && !applied.has(file))
    .sort();

  const record = db.query("INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)");
  for (const file of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    db.transaction(() => {
      db.exec(sql);
      record.run(file, Date.now());
    })();
  }
  return pending;
}

if (import.meta.main) {
  const db = openDatabase();
  const applied = runMigrations(db);
  db.close();
  console.log(
    applied.length > 0
      ? `Migrações aplicadas em ${resolveDbPath()}: ${applied.join(", ")}`
      : "Banco já está atualizado.",
  );
}
