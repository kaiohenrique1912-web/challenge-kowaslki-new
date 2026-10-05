import { SearchLayout, type SearchView } from "@qa/ui";
import { useState } from "react";
import { usePersistentState } from "../../lib/hooks.ts";
import { SiteHeader } from "../layout/SiteHeader.tsx";
import { useNeighborhoods } from "./queries.ts";
import { type HighlightedProperty, ResultsList } from "./ResultsList.tsx";
import { SearchFilters } from "./SearchFilters.tsx";
import { SearchMap } from "./SearchMap.tsx";
import { useSearchState } from "./use-search-state.ts";
import "./search-page.css";

/**
 * Página de busca (/comprar/imovel/:bairroSlug?). Todo o estado da busca vem da URL
 * (`useSearchState`); aqui só existe estado de tela (hover, Lista/Mapa no mobile).
 */
export function SearchPage() {
  const [state, setState] = useSearchState();
  const { bySlug, isLoaded } = useNeighborhoods();
  const [mobileView, setMobileView] = useState<SearchView>("list");
  const [highlighted, setHighlighted] = useState<HighlightedProperty | null>(null);
  const [searchOnMove, setSearchOnMove] = usePersistentState("qa:search-on-move", true);

  return (
    <SearchLayout
      header={<SiteHeader />}
      filters={<SearchFilters state={state} setState={setState} neighborhoods={bySlug} />}
      list={
        <ResultsList
          state={state}
          setState={setState}
          neighborhoods={bySlug}
          highlightedId={highlighted?.id ?? null}
          onHighlight={setHighlighted}
        />
      }
      map={
        <SearchMap
          state={state}
          setState={setState}
          neighborhoods={bySlug}
          neighborhoodsLoaded={isLoaded}
          searchOnMove={searchOnMove}
          onSearchOnMoveChange={setSearchOnMove}
          highlighted={highlighted}
        />
      }
      mobileView={mobileView}
      onMobileViewChange={setMobileView}
    />
  );
}
