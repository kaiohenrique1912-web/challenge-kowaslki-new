import type { Database } from "bun:sqlite";
import { yoga } from "@elysiajs/graphql-yoga";
import { Elysia } from "elysia";
import { createSchema, type GraphQLSchemaWithContext, type YogaInitialContext } from "graphql-yoga";
import { createContext, type GraphQLContext } from "./context.ts";
import { resolvers } from "./graphql/resolvers.ts";
import { typeDefs } from "./graphql/type-defs.ts";
import { photosRoutes } from "./modules/photos/photos.routes.ts";

export type AppOptions = {
  db: Database;
  /** Relógio injetável (testes usam um instante fixo). */
  now?: () => number;
};

/** Monta a aplicação sem abrir porta — usado pelo servidor (index.ts) e pelos testes. */
export function createApp({ db, now = Date.now }: AppOptions) {
  const contextFactory = ({ request }: YogaInitialContext): GraphQLContext =>
    createContext(db, request, now());
  const schema = createSchema<GraphQLContext>({ typeDefs, resolvers });
  return new Elysia().use(photosRoutes).use(
    yoga({
      // O tipo do plugin infere o contexto pelo schema; aqui o contexto vem de uma função.
      schema: schema as GraphQLSchemaWithContext<typeof contextFactory>,
      context: contextFactory,
      // GraphiQL em GET /graphql, útil em desenvolvimento.
      graphiql: true,
    }),
  );
}
