import type { ReactNode } from "react";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl.tsx";
import { cx } from "../../utils/cx.ts";
import "./SearchLayout.css";

export type SearchView = "list" | "map";

export type SearchLayoutProps = {
  /** Cabeçalho do site (AppHeader). */
  header?: ReactNode;
  /** Barra de filtros (FilterBar). */
  filters: ReactNode;
  /** Coluna da lista (rola sozinha). */
  list: ReactNode;
  /** Mapa (ocupa a altura toda à direita). */
  map: ReactNode;
  /** No mobile só uma área aparece; o botão flutuante alterna. */
  mobileView: SearchView;
  onMobileViewChange: (view: SearchView) => void;
  className?: string;
};

/**
 * Layout da busca: header + filtros no topo; lista à esquerda (rolável) e mapa à direita.
 * Abaixo de 768 px vira uma coluna com alternância "Lista | Mapa".
 */
export function SearchLayout({
  header,
  filters,
  list,
  map,
  mobileView,
  onMobileViewChange,
  className,
}: SearchLayoutProps) {
  return (
    <div className={cx("qa-search-layout", `qa-search-layout--show-${mobileView}`, className)}>
      {header}
      {filters}
      <div className="qa-search-layout__body">
        <main className="qa-search-layout__list" id="resultados">
          {list}
        </main>
        <section className="qa-search-layout__map" aria-label="Mapa dos imóveis">
          {map}
        </section>
      </div>
      <div className="qa-search-layout__toggle">
        <SegmentedControl
          label="Visualização"
          size="sm"
          options={[
            { value: "list", label: "Lista" },
            { value: "map", label: "Mapa" },
          ]}
          value={mobileView}
          onChange={onMobileViewChange}
        />
      </div>
    </div>
  );
}
