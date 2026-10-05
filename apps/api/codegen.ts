import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * Gera os tipos dos resolvers a partir do SDL (`bun run codegen`).
 * Rode sempre que alterar `src/graphql/schema/*.graphql`.
 */
const config: CodegenConfig = {
  schema: "src/graphql/schema/*.graphql",
  generates: {
    "src/graphql/generated/resolvers-types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        useIndexSignature: false,
        contextType: "../../context.ts#GraphQLContext",
        scalars: { DateTime: { input: "string", output: "number" } },
        mappers: {
          Property: "../../modules/properties/property-record.ts#PropertyRecord",
          PropertyConnection: "../../modules/properties/property-record.ts#PropertyConnectionModel",
          Neighborhood: "../../modules/neighborhoods/neighborhood-record.ts#NeighborhoodRecord",
        },
      },
    },
  },
};

export default config;
