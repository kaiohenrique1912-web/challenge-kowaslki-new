import type { ReactNode } from "react";
import { Chip } from "../../components/Chip/Chip.tsx";
import { Input } from "../../components/Input/Input.tsx";
import { cx } from "../../utils/cx.ts";
import "./FilterBar.css";

export type QuickFilter = {
  id: string;
  /** Texto do chip: o nome do filtro ou o valor escolhido ("Tipos de imóvel" / "3+ quartos"). */
  label: string;
  /** Há valor escolhido → chip azul. */
  active: boolean;
  /** O popover/painel deste chip está aberto. */
  open?: boolean;
};

export type FilterBarProps = {
  /** Campo de localização. Passe `locationSlot` para usar um autocomplete próprio. */
  location?: { value: string; onChange: (value: string) => void; placeholder?: string };
  locationSlot?: ReactNode;
  quickFilters: readonly QuickFilter[];
  onQuickFilterClick: (id: string) => void;
  onMoreFilters: () => void;
  /** Quantos filtros estão ativos ao todo (aparece em "Mais filtros"). */
  activeCount?: number;
  /** Conteúdo extra à direita (ex.: botão de ordenação). */
  trailing?: ReactNode;
  className?: string;
};

/**
 * Barra de filtros do topo da busca: localização + chips rápidos + "Mais filtros".
 * Só apresentação — o estado dos filtros vive na URL (apps/web).
 */
export function FilterBar({
  location,
  locationSlot,
  quickFilters,
  onQuickFilterClick,
  onMoreFilters,
  activeCount = 0,
  trailing,
  className,
}: FilterBarProps) {
  return (
    <section className={cx("qa-filter-bar", className)} aria-label="Filtros da busca">
      <div className="qa-filter-bar__location">
        {locationSlot ??
          (location && (
            <Input
              label="Localização"
              hideLabel
              appearance="pill"
              icon="location"
              placeholder={location.placeholder ?? "Rua, bairro ou código"}
              value={location.value}
              onChange={(e) => location.onChange(e.target.value)}
            />
          ))}
      </div>
      <div className="qa-filter-bar__chips">
        {quickFilters.map((filter) => (
          <Chip
            key={filter.id}
            hasMenu
            selected={filter.active}
            menuOpen={filter.open}
            onClick={() => onQuickFilterClick(filter.id)}
          >
            {filter.label}
          </Chip>
        ))}
      </div>
      <Chip
        icon="sliders"
        onClick={onMoreFilters}
        selected={activeCount > 0}
        aria-haspopup="dialog"
      >
        Mais filtros{activeCount > 0 && <span className="qa-filter-bar__count">{activeCount}</span>}
      </Chip>
      {trailing}
    </section>
  );
}
