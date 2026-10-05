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
import { memo, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import type { PropertyCardFieldsFragment } from "../../graphql/generated/graphql.ts";
import { useToggleFavorite } from "../favorites/use-favorites.ts";
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

/** Estado de navegação que o detalhe usa para "Voltar para a busca" (history.back). */
export const FROM_SEARCH_STATE = { fromSearch: true } as const;

type ResultCardProps = {
  node: PropertyCardFieldsFragment;
  highlighted: boolean;
  onHighlight: (property: HighlightedProperty | null) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onOpen: (id: string) => void;
};

/** Um card da lista. Memorizado: o hover de um card só redesenha ele e o card antes destacado. */
const ResultCard = memo(function ResultCard({
  node,
  highlighted,
  onHighlight,
  onToggleFavorite,
  onOpen,
}: ResultCardProps) {
  const property = useMemo(() => toCardData(node), [node]);
  return (
    <PropertyCard
      property={property}
      href={`/imovel/${node.id}`}
      onNavigate={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return; // nova aba: deixa o navegador
        e.preventDefault();
        onOpen(node.id);
      }}
      highlighted={highlighted}
      onHoverChange={(hovering) => onHighlight(hovering ? { id: node.id, ...node.location } : null)}
      onFavoriteToggle={(favorite) => onToggleFavorite(node.id, favorite)}
    />
  );
});

const SKELETONS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);
const scrollKey = (url: string) => `qa:scroll:${url}`;

/** Coluna da lista: cabeçalho com contagem e ordenação, cards, "Ver mais" e estados. */
export function ResultsList({ state, setState, neighborhoods, onHighlight, highlightedId }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const toggleFavorite = useToggleFavorite();
  const filters = useMemo(() => toApiFilters(state, "list"), [state]);
  const results = useSearchResults(filters, state.sort);
  const nodes = results.data?.pages.flatMap((p) => p.searchProperties.nodes) ?? [];
  const total = results.data?.pages[0]?.searchProperties.totalCount;
  const url = `${location.pathname}${location.search}`;

  const openProperty = useMemo(
    () => (id: string) => navigate(`/imovel/${id}`, { state: FROM_SEARCH_STATE }),
    [navigate],
  );

  // Rolagem: nova busca → topo; voltar do detalhe → posição salva para esta URL.
  const searchKey = JSON.stringify([filters, state.sort]);
  const previousKey = useRef<string | null>(null);
  const restored = useRef(false);
  useEffect(() => {
    if (previousKey.current !== null && previousKey.current !== searchKey) {
      document.getElementById("resultados")?.scrollTo({ top: 0 });
    }
    previousKey.current = searchKey;
  }, [searchKey]);
  useLayoutEffect(() => {
    if (restored.current || nodes.length === 0) return;
    restored.current = true;
    const saved = Number(sessionStorage.getItem(scrollKey(url)) ?? 0);
    if (saved > 0) document.getElementById("resultados")?.scrollTo({ top: saved });
  }, [nodes.length, url]);
  useEffect(() => {
    const list = document.getElementById("resultados");
    if (!list) return;
    const save = () => sessionStorage.setItem(scrollKey(url), String(Math.round(list.scrollTop)));
    list.addEventListener("scroll", save, { passive: true });
    return () => list.removeEventListener("scroll", save);
  }, [url]);

  const onlyNeighborhood =
    state.neighborhoodSlugs.length === 1
      ? neighborhoods.get(state.neighborhoodSlugs[0] ?? "")
      : undefined;
  const heading = searchResultsHeading({
    count: total ?? 0,
    types: state.filters.types,
    minBedrooms: state.filters.minBedrooms,
    neighborhoodName: state.drawnArea ? undefined : onlyNeighborhood?.name,
    onlyFavorites: state.onlyFavorites,
    drawnArea: Boolean(state.drawnArea),
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
    const onlyFavorites = state.onlyFavorites === true;
    return (
      <>
        {header}
        <StatusMessage
          icon={onlyFavorites ? "heart" : "search"}
          title={onlyFavorites ? "Nenhum favorito por aqui" : "Nenhum imóvel encontrado"}
          description={
            onlyFavorites
              ? "Toque no coração dos imóveis que você gostar para guardá-los aqui."
              : state.mapArea
                ? "Tente remover filtros ou mover o mapa para outra região."
                : "Tente remover alguns filtros ou buscar em outro bairro."
          }
          action={
            <Button
              variant="secondary"
              onClick={() =>
                setState((s) =>
                  onlyFavorites ? { ...s, onlyFavorites: undefined } : { ...s, filters: {} },
                )
              }
            >
              {onlyFavorites ? "Ver todos os imóveis" : "Limpar filtros"}
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
                <ResultCard
                  node={node}
                  highlighted={highlightedId === node.id}
                  onHighlight={onHighlight}
                  onToggleFavorite={toggleFavorite}
                  onOpen={openProperty}
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
