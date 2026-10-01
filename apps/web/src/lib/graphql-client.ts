type GraphQLResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

/**
 * Cliente GraphQL mínimo. Na Etapa 5 passa a usar documentos tipados gerados pelo codegen.
 */
export async function graphqlRequest<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`Falha na requisição GraphQL (HTTP ${response.status})`);

  const body = (await response.json()) as GraphQLResponse<TData>;
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join("; "));
  if (!body.data) throw new Error("Resposta GraphQL sem dados");
  return body.data;
}
