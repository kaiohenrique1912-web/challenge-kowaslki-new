import {
  type InfiniteData,
  type QueryClient,
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import type {
  PropertyDetailQuery,
  PropertyPreviewQuery,
  SearchPropertiesQuery,
} from "../../graphql/generated/graphql.ts";
import {
  addFavoriteDocument,
  favoritesCountDocument,
  removeFavoriteDocument,
} from "../../graphql/operations.ts";
import { graphqlRequest } from "../../lib/graphql-client.ts";

const COUNT_KEY = ["favorites-count"] as const;

/** Quantos favoritos o usuário anônimo tem (contador do cabeçalho). */
export function useFavoritesCount() {
  return useQuery({
    queryKey: COUNT_KEY,
    queryFn: ({ signal }) => graphqlRequest(favoritesCountDocument, undefined, signal),
    select: (data) => data.favoritesCount,
  });
}

type Snapshot = [QueryKey, unknown][];

/** Aplica `isFavorite` em todos os caches que mostram o imóvel (lista, prévia, detalhe). */
function applyOptimistic(client: QueryClient, id: string, favorite: boolean): Snapshot {
  const snapshot: Snapshot = [
    ...client.getQueriesData({ queryKey: ["search"] }),
    ...client.getQueriesData({ queryKey: ["property"] }),
    ...client.getQueriesData({ queryKey: ["property-preview"] }),
    ...client.getQueriesData({ queryKey: COUNT_KEY }),
  ];
  client.setQueriesData<InfiniteData<SearchPropertiesQuery>>({ queryKey: ["search"] }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            searchProperties: {
              ...page.searchProperties,
              nodes: page.searchProperties.nodes.map((n) =>
                n.id === id ? { ...n, isFavorite: favorite } : n,
              ),
            },
          })),
        }
      : data,
  );
  for (const key of ["property", "property-preview"]) {
    client.setQueriesData<PropertyDetailQuery | PropertyPreviewQuery>(
      { queryKey: [key, id] },
      (data) => (data?.property ? { property: { ...data.property, isFavorite: favorite } } : data),
    );
  }
  client.setQueryData<{ favoritesCount: number }>(COUNT_KEY, (data) =>
    data ? { favoritesCount: Math.max(0, data.favoritesCount + (favorite ? 1 : -1)) } : data,
  );
  return snapshot;
}

/** A busca "só favoritos" (lista, mapa e contagens) precisa ser refeita após mudar um favorito. */
const dependsOnFavorites = (key: QueryKey) =>
  ["search", "map", "count"].includes(String(key[0])) &&
  typeof key[1] === "object" &&
  key[1] !== null &&
  "onlyFavorites" in key[1];

/**
 * Favoritar/desfavoritar com atualização otimista: o coração muda na hora em todo lugar e volta
 * ao estado anterior se a API falhar. Retorna uma função estável `(id, favorite) => void`.
 */
export function useToggleFavorite() {
  const client = useQueryClient();
  const mutation = useMutation<void, Error, { id: string; favorite: boolean }, Snapshot>({
    mutationFn: async ({ id, favorite }) => {
      if (favorite) await graphqlRequest(addFavoriteDocument, { propertyId: id });
      else await graphqlRequest(removeFavoriteDocument, { propertyId: id });
    },
    onMutate: async ({ id, favorite }) => {
      await client.cancelQueries({ queryKey: ["search"] });
      return applyOptimistic(client, id, favorite);
    },
    onError: (_error, _vars, snapshot) => {
      for (const [key, data] of snapshot ?? []) client.setQueryData(key, data);
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: COUNT_KEY });
      void client.invalidateQueries({ predicate: (q) => dependsOnFavorites(q.queryKey) });
    },
  });
  const { mutate } = mutation;
  return useCallback((id: string, favorite: boolean) => mutate({ id, favorite }), [mutate]);
}
