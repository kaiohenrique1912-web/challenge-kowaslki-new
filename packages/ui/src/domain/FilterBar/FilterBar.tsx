import type { ReactNode } from "react";
import { Chip } from "../../components/Chip/Chip.tsx";
import { Input } from "../../components/Input/Input.tsx";
import { Popover } from "../../components/Popover/Popover.tsx";
import { cx } from "../../utils/cx.ts";
import "./FilterBar.css";

export type QuickFilter = {
  id: string;
  /** Texto do chip: o nome do filtro ou o valor escolhido ("Quartos" / "3+ quartos"). */
  label: string;
  /** Há valor escolhido → chip azul. */
  active: boolean;
  /** Conteúdo do painel que abre embaixo do chip (ex.: CounterSelector de quartos). */
  panel?: ReactNode;
  /** Rodapé do painel (ex.: "Limpar" + "Ver 13 imóveis"). */
  panelFooter?: ReactNode;
};

export type FilterBarProps = {
  /** Campo de localização simples. Passe `locationSlot` para usar um autocomplete. */
  location?: { value: string; onChange: (value: string) => void; placeholder?: string };
  locationSlot?: ReactNode;
  quickFilters: readonly QuickFilter[];
  /** Id do chip com o painel aberto (null = nenhum). */
  openFilterId: string | null;
  onOpenFilterChange: (id: string | null) => void;
  onMoreFilters: () => void;
  /** Quantos filtros estão ativos ao todo (aparece em "Mais filtros"). */
  activeCount?: number;
  /** Conteúdo extra à direita. */
  trailing?: ReactNode;
  className?: string;
};

/**
 * Barra de filtros do topo da busca: localização + chips rápidos (cada um abre um Popover com
 * o seu filtro) + "Mais filtros". Só apresentação — o estado dos filtros vive na URL (apps/web).
 */
export function FilterBar({
  location,
  locationSlot,
  quickFilters,
  openFilterId,
  onOpenFilterChange,
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
        {quickFilters.map((filter) => {
          const open = openFilterId === filter.id;
          const chip = (
            <Chip
              key={filter.id}
              hasMenu
              selected={filter.active}
              menuOpen={open}
              onClick={() => onOpenFilterChange(open ? null : filter.id)}
            >
              {filter.label}
            </Chip>
          );
          return filter.panel ? (
            <Popover
              key={filter.id}
              open={open}
              onClose={() => onOpenFilterChange(null)}
              label={filter.label}
              anchor={chip}
              footer={filter.panelFooter}
            >
              {filter.panel}
            </Popover>
          ) : (
            <span key={filter.id} className="qa-filter-bar__chip">
              {chip}
            </span>
          );
        })}
      </div>
      <Chip
        icon="sliders"
        onClick={onMoreFilters}
        selected={activeCount > 0}
        aria-haspopup="dialog"
      >
        Mais filtros
        {activeCount > 0 && (
          <span className="qa-filter-bar__count">
            {activeCount}
            <span className="qa-visually-hidden"> ativos</span>
          </span>
        )}
      </Chip>
      {trailing}
    </section>
  );
}
