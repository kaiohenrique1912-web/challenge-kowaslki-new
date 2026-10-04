import { yoga } from "@elysiajs/graphql-yoga";
import { Elysia } from "elysia";
import { resolvers } from "./graphql/resolvers.ts";
import { typeDefs } from "./graphql/type-defs.ts";
import { photosRoutes } from "./modules/photos/photos.routes.ts";

/** Monta a aplicação sem abrir porta — usado pelo servidor (index.ts) e pelos testes. */
export function createApp() {
  return new Elysia().use(photosRoutes).use(
    yoga({
      typeDefs,
      resolvers,
      // GraphiQL em GET /graphql, útil em desenvolvimento.
      graphiql: true,
    }),
  );
}
