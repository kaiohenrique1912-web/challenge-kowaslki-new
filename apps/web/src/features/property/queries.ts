import { useQuery } from "@tanstack/react-query";
import { propertyDetailDocument } from "../../graphql/operations.ts";
import { graphqlRequest } from "../../lib/graphql-client.ts";

/** Imóvel completo para a página de detalhe (`null` = não existe ou não está ativo). */
export function usePropertyDetail(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: ({ signal }) => graphqlRequest(propertyDetailDocument, { id }, signal),
    select: (data) => data.property,
  });
}
