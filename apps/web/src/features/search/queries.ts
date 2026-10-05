import { type BoundingBox, SEARCH_PAGE_SIZE, type SearchFilters, type SortOrder } from "@qa/shared";
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  locationSuggestionsDocument,
  mapClustersDocument,
  neighborhoodsDocument,
  propertyPreviewDocument,
  searchCountDocument,
  searchPropertiesDocument,
} from "../../graphql/operations.ts";
import { graphqlRequest } from "../../lib/graphql-client.ts";

/** Hooks de dados da busca (TanStack Query + operações tipadas pelo codegen). */

export function useSearchResults(filters: SearchFilters, sort: SortOrder) {
  return useInfiniteQuery({
    queryKey: ["search", filters, sort],
    queryFn: ({ pageParam, signal }) =>
      graphqlRequest(
        searchPropertiesDocument,
        { filters, sort, first: SEARCH_PAGE_SIZE.default, after: pageParam },
        signal,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) =>
      last.searchProperties.pageInfo.hasNextPage ? last.searchProperties.pageInfo.endCursor : null,
  });
}

/** Contagem para "Ver N imóveis" (painel e filtros rápidos), só com os filtros em rascunho. */
export function useResultCount(filters: SearchFilters, enabled: boolean) {
  return useQuery({
    queryKey: ["count", filters],
    queryFn: ({ signal }) => graphqlRequest(searchCountDocument, { filters }, signal),
    select: (data) => data.searchProperties.totalCount,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useMapClusters(
  filters: SearchFilters,
  viewport: { bbox: BoundingBox; zoom: number } | null,
) {
  return useQuery({
    queryKey: ["map", filters, viewport],
    queryFn: ({ signal }) => {
      if (!viewport) throw new Error("Mapa ainda sem área visível");
      return graphqlRequest(
        mapClustersDocument,
        { filters, bbox: viewport.bbox, zoom: viewport.zoom },
        signal,
      );
    },
    select: (data) => data.propertyMapClusters,
    enabled: viewport !== null,
    placeholderData: keepPreviousData,
  });
}

export function usePropertyPreview(id: string | null) {
  return useQuery({
    queryKey: ["property-preview", id],
    queryFn: ({ signal }) => graphqlRequest(propertyPreviewDocument, { id: id ?? "" }, signal),
    select: (data) => data.property,
    enabled: id !== null,
  });
}

export function useLocationSuggestions(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ["location-suggestions", query],
    queryFn: ({ signal }) => graphqlRequest(locationSuggestionsDocument, { query }, signal),
    select: (data) => data.locationSuggestions,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export type NeighborhoodInfo = {
  slug: string;
  name: string;
  center: { lat: number; lng: number };
  bounds: BoundingBox;
};

/** Os 102 bairros (nome, centro e limites) — carregados uma vez e guardados em cache. */
export function useNeighborhoods() {
  const query = useQuery({
    queryKey: ["neighborhoods"],
    queryFn: ({ signal }) => graphqlRequest(neighborhoodsDocument, undefined, signal),
    staleTime: Number.POSITIVE_INFINITY,
  });
  const bySlug = useMemo(
    () =>
      new Map<string, NeighborhoodInfo>((query.data?.neighborhoods ?? []).map((n) => [n.slug, n])),
    [query.data],
  );
  return { bySlug, isLoaded: query.isSuccess };
}
