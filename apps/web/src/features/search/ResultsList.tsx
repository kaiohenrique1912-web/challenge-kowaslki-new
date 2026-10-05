import { type SearchState, searchResultsHeading, toApiFilters } from "@qa/shared";
import {
  Button,
  PropertyCard,
  type PropertyCardData,
  PropertyCardSkeleton,
  ResultsHeader,
  SortMenu,
  StatusMessage,
} from "@qa/ui";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import type { PropertyCardFieldsFragment } from "../../graphql/generated/graphql.ts";
import { type NeighborhoodInfo, useSearchResults } from "./queries.ts";
import type { SetSearchState } from "./use-search-state.ts";

export type HighlightedProperty = { id: string; lat: number; lng: number };

type Props = {
  state: SearchState;
  setState: SetSearchState;
  neighborhoods: Map<string, NeighborhoodInfo>;
  onHighlight: (property: HighlightedProperty | null) => void;
  highlightedId: string | null;
};

/** Converte o resultado da API no formato do card do design system. */
export function toCardData(node: PropertyCardFieldsFragment): PropertyCardData {
  return {
    id: node.id,
    type: node.type,
    title: node.title,
    salePrice: node.salePrice,
    monthlyCost: node.monthlyCost,
    area: node.area,
    bedrooms: node.bedrooms,
    parkingSpaces: node.parkingSpaces,
    street: node.street,
    neighborhoodName: node.neighborhood.name,
    photos: node.photos.map((p) => p.url),
    badges: node.badges,
    isFavorite: node.isFavorite,
  };
}

const SKELETONS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);

/** Coluna da lista: cabeçalho com contagem e ordenação, cards, "Ver mais" e estados. */
export function ResultsList({ state, setState, neighborhoods, onHighlight, highlightedId }: Props) {
  const navigate = useNavigate();
  const filters = useMemo(() => toApiFilters(state, "list"), [state]);
  const results = useSearchResults(filters, state.sort);
  const nodes = results.data?.pages.flatMap((p) => p.searchProperties.nodes) ?? [];
  const total = results.data?.pages[0]?.searchProperties.totalCount;

  // Nova busca → volta a lista para o topo.
  const searchKey = JSON.stringify([filters, state.sort]);
  useEffect(() => {
    if (searchKey) document.getElementById("resultados")?.scrollTo({ top: 0 });
  }, [searchKey]);

  const onlyNeighborhood =
    state.neighborhoodSlugs.length === 1
      ? neighborhoods.get(state.neighborhoodSlugs[0] ?? "")
      : undefined;
  const heading = searchResultsHeading({
    count: total ?? 0,
    types: state.filters.types,
    minBedrooms: state.filters.minBedrooms,
    neighborhoodName: onlyNeighborhood?.name,
  });

  const header = (
    <ResultsHeader
      title={heading.title}
      subtitle={heading.subtitle}
      loading={total === undefined && !results.isError}
      actions={
        <SortMenu value={state.sort} onChange={(sort) => setState((s) => ({ ...s, sort }))} />
      }
    />
  );

  if (results.isError) {
    return (
      <>
        {header}
        <StatusMessage
          tone="error"
          title="Não foi possível carregar os imóveis"
          description={results.error.message}
          action={
            <Button variant="secondary" onClick={() => results.refetch()}>
              Tentar novamente
            </Button>
          }
        />
      </>
    );
  }

  if (results.isSuccess && nodes.length === 0) {
    return (
      <>
        {header}
        <StatusMessage
          title="Nenhum imóvel encontrado"
          description={
            state.mapArea
              ? "Tente remover filtros ou mover o mapa para outra região."
              : "Tente remover alguns filtros ou buscar em outro bairro."
          }
          action={
            <Button variant="secondary" onClick={() => setState((s) => ({ ...s, filters: {} }))}>
              Limpar filtros
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      {header}
      <ul className="search-results-grid" aria-busy={results.isFetching}>
        {results.isPending
          ? SKELETONS.map((key) => (
              <li key={key}>
                <PropertyCardSkeleton />
              </li>
            ))
          : nodes.map((node) => (
              <li key={node.id}>
                <PropertyCard
                  property={toCardData(node)}
                  href={`/imovel/${node.id}`}
                  onNavigate={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey) return; // nova aba: deixa o navegador
                    e.preventDefault();
                    navigate(`/imovel/${node.id}`);
                  }}
                  highlighted={highlightedId === node.id}
                  onHoverChange={(hovering) =>
                    onHighlight(hovering ? { id: node.id, ...node.location } : null)
                  }
                />
              </li>
            ))}
      </ul>
      {results.hasNextPage && (
        <div className="search-results-more">
          <Button
            variant="secondary"
            loading={results.isFetchingNextPage}
            onClick={() => results.fetchNextPage()}
          >
            Ver mais
          </Button>
        </div>
      )}
    </>
  );
}
