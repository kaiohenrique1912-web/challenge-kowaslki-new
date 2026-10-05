import type { Database } from "bun:sqlite";
import { createLoaders, type Loaders } from "./graphql/loaders.ts";

/** Contexto de cada request GraphQL (docs/architecture.md §3). */
export type GraphQLContext = {
  db: Database;
  /** UUID anônimo do header `x-user-id` (favoritos); null se ausente ou inválido. */
  userId: string | null;
  /** Instante de referência da request (epoch ms) — fixo durante a request. */
  now: number;
  loaders: Loaders;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function readUserId(request: Request): string | null {
  const value = request.headers.get("x-user-id");
  return value && UUID_PATTERN.test(value) ? value.toLowerCase() : null;
}

export function createContext(db: Database, request: Request, now: number): GraphQLContext {
  const userId = readUserId(request);
  return { db, userId, now, loaders: createLoaders(db, userId) };
}
