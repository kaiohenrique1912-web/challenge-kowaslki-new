import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * Gera o cliente GraphQL tipado do web (`bun run codegen`) a partir do SDL da api e das
 * operações escritas com `graphql(...)` em `src/graphql/operations.ts`.
 */
const config: CodegenConfig = {
  schema: "../api/src/graphql/schema/*.graphql",
  documents: ["src/**/*.{ts,tsx}", "!src/graphql/generated/**"],
  ignoreNoDocuments: false,
  generates: {
    "src/graphql/generated/": {
      preset: "client",
      presetConfig: { fragmentMasking: false },
      config: {
        documentMode: "string",
        enumsAsTypes: true,
        useTypeImports: true,
        scalars: { DateTime: "string" },
      },
    },
  },
};

export default config;
