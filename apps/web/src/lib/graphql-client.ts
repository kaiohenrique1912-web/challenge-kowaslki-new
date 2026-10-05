import type { TypedDocumentString } from "../graphql/generated/graphql.ts";
import { getUserId } from "./user-id.ts";

type GraphQLErrorPayload = {
  message: string;
  extensions?: { code?: string; field?: string };
};

/** Erro da API GraphQL com o código e o campo inválido (ex.: field "filters.price"). */
export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "GraphQLRequestError";
  }
}

/**
 * Executa uma operação gerada pelo codegen (`src/graphql/operations.ts`). Resultado e
 * variáveis são tipados pelo schema; envia o usuário anônimo em `x-user-id`.
 */
export async function graphqlRequest<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables,
  signal?: AbortSignal,
): Promise<TResult> {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json", "x-user-id": getUserId() },
    body: JSON.stringify({ query: document.toString(), variables }),
    signal,
  });
  const body = (await response.json().catch(() => ({}))) as {
    data?: TResult;
    errors?: GraphQLErrorPayload[];
  };
  const first = body.errors?.[0];
  if (first)
    throw new GraphQLRequestError(first.message, first.extensions?.code, first.extensions?.field);
  if (!response.ok || !body.data) {
    throw new GraphQLRequestError(`Falha na comunicação com a API (HTTP ${response.status}).`);
  }
  return body.data;
}
