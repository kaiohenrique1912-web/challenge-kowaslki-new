import { createApp } from "./app.ts";
import { openDatabase, resolveDbPath } from "./db/client.ts";
import { runMigrations } from "./db/migrate.ts";

const port = Number(process.env.PORT ?? 4000);

const db = openDatabase();
runMigrations(db);
const total = db.query<{ n: number }, []>("SELECT COUNT(*) AS n FROM properties").get()?.n ?? 0;
if (total === 0) {
  console.warn(`Banco vazio em ${resolveDbPath()}. Rode \`bun run seed\` para gerar os imóveis.`);
}

createApp({ db }).listen(port);

console.log(
  `API GraphQL em http://localhost:${port}/graphql (${total.toLocaleString("pt-BR")} imóveis)`,
);
