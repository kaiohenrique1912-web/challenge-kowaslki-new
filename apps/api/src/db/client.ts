import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

/** Caminho padrão do banco: apps/api/data/app.db (fora do git). Sobrescreva com DB_PATH. */
export const DEFAULT_DB_PATH = join(import.meta.dir, "..", "..", "data", "app.db");

export function resolveDbPath(): string {
  return process.env.DB_PATH ?? DEFAULT_DB_PATH;
}

/** Abre o SQLite com as configurações do projeto. Use ":memory:" nos testes. */
export function openDatabase(path: string = resolveDbPath()): Database {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { create: true, strict: true });
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA synchronous = NORMAL;");
  return db;
}
