import {
  describeMin,
  EMPTY_SEARCH_STATE,
  formatCompactBRL,
  HOME_PRICE_MAX_OPTIONS,
  MIN_COUNT_FILTER_MAX,
  type SearchState,
  searchStateToUrl,
} from "@qa/shared";
import { Button, SegmentedControl, Select, TabBar } from "@qa/ui";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useOutOfScope } from "../layout/out-of-scope.tsx";
import { SiteHeader } from "../layout/SiteHeader.tsx";
import { LocationSearch } from "../search/LocationSearch.tsx";
import { useNeighborhoods } from "../search/queries.ts";
import "./home-page.css";

const BEDROOM_OPTIONS = Array.from({ length: MIN_COUNT_FILTER_MAX.bedrooms }, (_, i) => i + 1);

/**
 * Home (/): card "Buscar imóveis" sobre a foto, como em docs/reference/buscar_imoveis.jpeg.
 * Monta uma busca (bairro, valor até, quartos) e abre /comprar/imovel com ela na URL.
 * "Anunciar imóveis" e "Alugar" ficam fora do escopo (aviso).
 */
export function HomePage() {
  const navigate = useNavigate();
  const notAvailable = useOutOfScope();
  const { bySlug } = useNeighborhoods();
  const [draft, setDraft] = useState<SearchState>(EMPTY_SEARCH_STATE);

  const setFilter = (changes: Partial<SearchState["filters"]>) =>
    setDraft((s) => ({ ...s, filters: { ...s.filters, ...changes } }));

  return (
    <>
      <SiteHeader />
      <main className="home-hero">
        <section className="home-card" aria-labelledby="home-title">
          <SegmentedControl
            label="O que você quer fazer"
            size="sm"
            value="search"
            onChange={(v) => v === "advertise" && notAvailable("Anunciar imóveis")}
            options={[
              { value: "search", label: "Buscar imóveis" },
              { value: "advertise", label: "Anunciar imóveis" },
            ]}
            className="home-card__mode"
          />
          <h1 id="home-title" className="home-card__title">
            Compre um lar para chamar de seu
          </h1>
          <TabBar
            label="Tipo de negócio"
            value="buy"
            onChange={(v) => v === "rent" && notAvailable("Alugar")}
            items={[
              { value: "rent", label: "Alugar" },
              { value: "buy", label: "Comprar" },
            ]}
          />
          <form
            className="home-card__form"
            onSubmit={(event) => {
              event.preventDefault();
              navigate(searchStateToUrl(draft));
            }}
          >
            <LocationSearch
              state={draft}
              setState={(next) => setDraft((s) => (typeof next === "function" ? next(s) : next))}
              neighborhoods={bySlug}
              placeholder="Busque por bairro, rua ou código"
            />
            <div className="home-card__row">
              <Select
                label="Valor do imóvel até"
                placeholder="Escolha o valor"
                value={draft.filters.price?.max?.toString() ?? ""}
                onChange={(e) =>
                  setFilter({
                    price: e.target.value ? { max: Number(e.target.value) } : undefined,
                  })
                }
                options={HOME_PRICE_MAX_OPTIONS.map((v) => ({
                  value: String(v),
                  label: formatCompactBRL(v),
                }))}
              />
              <Select
                label="Quartos"
                placeholder="Nº de quartos"
                value={draft.filters.minBedrooms?.toString() ?? ""}
                onChange={(e) =>
                  setFilter({ minBedrooms: e.target.value ? Number(e.target.value) : undefined })
                }
                options={BEDROOM_OPTIONS.map((n) => ({
                  value: String(n),
                  label: describeMin.bedrooms(n),
                }))}
              />
            </div>
            <Button type="submit" fullWidth>
              Buscar imóveis
            </Button>
          </form>
        </section>
      </main>
    </>
  );
}
