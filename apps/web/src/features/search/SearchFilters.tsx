import {
  BUSINESS_CHIP_LABEL,
  CITY,
  countActiveFilters,
  DEFAULT_SORT,
  LAUNCHES_CHIP_LABEL,
  type PropertyFilters,
  pluralize,
  QUICK_FILTER_IDS,
  QUICK_FILTERS,
  type QuickFilterId,
  quickFilterLabel,
  type SearchState,
  STATE,
  toApiFilters,
  validatePropertyFilters,
} from "@qa/shared";
import {
  AreaFilter,
  Button,
  Drawer,
  FilterBar,
  FilterPanel,
  MinCountFilter,
  MonthlyCostFilter,
  PriceFilter,
  PropertyTypesFilter,
  type QuickFilter,
  SegmentedControl,
  YesNoFilter,
} from "@qa/ui";
import { type ReactNode, useState } from "react";
import { useDebouncedValue } from "../../lib/hooks.ts";
import { useOutOfScope } from "../layout/out-of-scope.tsx";
import { SearchAlertButton } from "../search-alerts/SearchAlertButton.tsx";
import { LocationSearch } from "./LocationSearch.tsx";
import { type NeighborhoodInfo, useResultCount } from "./queries.ts";
import type { SetSearchState } from "./use-search-state.ts";

type Props = {
  state: SearchState;
  setState: SetSearchState;
  neighborhoods: Map<string, NeighborhoodInfo>;
};

/**
 * Barra de filtros da busca. Chips rápidos e o painel "Mais filtros" editam um RASCUNHO; o botão
 * "Ver N imóveis" mostra a contagem do rascunho ao vivo e só então aplica na URL.
 */
export function SearchFilters({ state, setState, neighborhoods }: Props) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState<PropertyFilters>(state.filters);
  /** "Ordenar pelo maior retorno com aluguel" do painel (é ordenação, não filtro). */
  const [sortByYield, setSortByYield] = useState(false);
  const notAvailable = useOutOfScope();

  const editing = openFilter !== null || panelOpen;
  const draftErrors = validatePropertyFilters(draft);
  const hasErrors = Object.keys(draftErrors).length > 0;
  const draftApiFilters = useDebouncedValue(
    toApiFilters({ ...state, filters: draft }, "list"),
    300,
  );
  const count = useResultCount(draftApiFilters, editing && !hasErrors);

  const startEditing = () => {
    setDraft(state.filters);
    setSortByYield(state.sort === "RENTAL_YIELD_DESC");
  };
  const apply = () => {
    setState((s) => ({
      ...s,
      filters: draft,
      sort: sortByYield
        ? "RENTAL_YIELD_DESC"
        : s.sort === "RENTAL_YIELD_DESC"
          ? DEFAULT_SORT
          : s.sort,
    }));
    setOpenFilter(null);
    setPanelOpen(false);
  };

  const seeResultsButton = (size: "sm" | "md") => (
    <Button
      size={size}
      onClick={apply}
      disabled={hasErrors}
      loading={count.isFetching && count.data === undefined}
    >
      {hasErrors || count.data === undefined
        ? "Ver imóveis"
        : `Ver ${pluralize(count.data, "imóvel", "imóveis")}`}
    </Button>
  );

  const quickFooter = (id: QuickFilterId): ReactNode => (
    <>
      <Button
        variant="link"
        onClick={() => {
          const next = { ...draft };
          for (const key of QUICK_FILTERS[id].keys) delete next[key];
          setDraft(next);
        }}
      >
        Limpar
      </Button>
      {seeResultsButton("sm")}
    </>
  );

  const sectionProps = { value: draft, onChange: setDraft };
  const panels: Record<QuickFilterId, ReactNode> = {
    price: <PriceFilter {...sectionProps} />,
    monthlyCost: <MonthlyCostFilter {...sectionProps} />,
    types: <PropertyTypesFilter {...sectionProps} />,
    bedrooms: <MinCountFilter field="bedrooms" {...sectionProps} />,
    parking: <MinCountFilter field="parkingSpaces" {...sectionProps} />,
    bathrooms: <MinCountFilter field="bathrooms" {...sectionProps} />,
    area: <AreaFilter {...sectionProps} />,
    furnished: <YesNoFilter field="furnished" {...sectionProps} />,
    nearSubway: <YesNoFilter field="nearSubway" {...sectionProps} />,
    suites: <MinCountFilter field="suites" {...sectionProps} />,
  };
  // Como no original, a barra começa com "Comprar" (tipo de negócio) e "Lançamentos" — aluguel e
  // lançamentos estão fora do escopo e mostram o aviso.
  const leadingChips: QuickFilter[] = [
    {
      id: "business",
      label: BUSINESS_CHIP_LABEL,
      active: true,
      panel: (
        <SegmentedControl
          label="Tipo de negócio"
          value="buy"
          onChange={(v) => {
            if (v === "rent") {
              setOpenFilter(null);
              notAvailable("Alugar");
            }
          }}
          options={[
            { value: "rent", label: "Alugar" },
            { value: "buy", label: "Comprar" },
          ]}
        />
      ),
    },
    { id: "launches", label: LAUNCHES_CHIP_LABEL, active: false },
  ];
  const quickFilters: QuickFilter[] = [
    ...leadingChips,
    ...QUICK_FILTER_IDS.map((id) => ({
      id,
      ...quickFilterLabel(id, state.filters),
      panel: panels[id],
      panelFooter: quickFooter(id),
    })),
  ];

  return (
    <>
      <FilterBar
        locationSlot={
          <LocationSearch
            state={state}
            setState={setState}
            neighborhoods={neighborhoods}
            placeholder={
              state.drawnArea ? "Área desenhada no mapa" : `Qualquer lugar em ${CITY}, ${STATE}`
            }
          />
        }
        quickFilters={quickFilters}
        openFilterId={openFilter}
        onOpenFilterChange={(id) => {
          if (id === "launches") {
            notAvailable(LAUNCHES_CHIP_LABEL);
            return;
          }
          if (id) startEditing();
          setOpenFilter(id);
        }}
        onMoreFilters={() => {
          startEditing();
          setOpenFilter(null);
          setPanelOpen(true);
        }}
        activeCount={countActiveFilters(state.filters)}
        trailing={<SearchAlertButton />}
      />
      <Drawer
        side="left"
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Filtros"
        hideTitle
        footer={
          <>
            <Button
              variant="link"
              onClick={() => {
                setDraft({});
                setSortByYield(false);
              }}
            >
              Limpar
            </Button>
            {seeResultsButton("md")}
          </>
        }
      >
        <FilterPanel
          {...sectionProps}
          sortByYield={sortByYield}
          onSortByYieldChange={setSortByYield}
        />
      </Drawer>
    </>
  );
}
