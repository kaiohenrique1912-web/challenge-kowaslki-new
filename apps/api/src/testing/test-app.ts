import type { Database } from "bun:sqlite";
import { createApp } from "../app.ts";
import { openDatabase } from "../db/client.ts";
import { runMigrations } from "../db/migrate.ts";
import { seedDatabase } from "../db/seed/index.ts";

/** Instante fixo dos testes — datas de publicação e badges ficam determinísticos. */
export const TEST_NOW = Date.UTC(2026, 9, 1, 12);
export const TEST_SEED_COUNT = 5_000;

let cachedDb: Database | null = null;

/** Banco em memória com 5.000 imóveis (seed 42), criado uma vez e compartilhado entre testes. */
export function getTestDb(): Database {
  if (!cachedDb) {
    cachedDb = openDatabase(":memory:");
    runMigrations(cachedDb);
    seedDatabase(cachedDb, { count: TEST_SEED_COUNT, seed: 42, now: TEST_NOW });
  }
  return cachedDb;
}

export function createTestApp() {
  return createApp({ db: getTestDb(), now: () => TEST_NOW });
}

export type GqlResponse<T> = {
  data?: T;
  errors?: { message: string; extensions?: { code?: string; field?: string } }[];
};

/** Executa uma operação GraphQL contra a app, como o web faria. */
export async function gql<T = Record<string, unknown>>(
  app: ReturnType<typeof createApp>,
  query: string,
  variables?: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<GqlResponse<T>> {
  const response = await app.handle(
    new Request("http://localhost/graphql", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify({ query, variables }),
    }),
  );
  return (await response.json()) as GqlResponse<T>;
}
