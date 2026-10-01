import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const schemaDir = join(import.meta.dir, "schema");

/** Junta todos os arquivos SDL de `schema/` (fonte da verdade do contrato GraphQL). */
export const typeDefs: string[] = readdirSync(schemaDir)
  .filter((file) => file.endsWith(".graphql"))
  .sort()
  .map((file) => readFileSync(join(schemaDir, file), "utf8"));
