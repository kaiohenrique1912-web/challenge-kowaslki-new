import { type ReactNode, useEffect, useRef, useState } from "react";
import { Chip } from "../../components/Chip/Chip.tsx";
import { IconButton } from "../../components/IconButton/IconButton.tsx";
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
  /** Quantos filtros estão ativos ao todo (lido por leitores de tela em "Mais filtros"). */
  activeCount?: number;
  /** Conteúdo extra à direita (ex.: "Criar alerta de imóvel"). */
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
  const chipsRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ start: false, end: false });

  // Setas ‹ › aparecem quando os chips não cabem (como no original).
  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    const update = () =>
      setOverflow({
        start: el.scrollLeft > 1,
        end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  const scrollChips = (direction: 1 | -1) =>
    chipsRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" });

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
      <div className="qa-filter-bar__scroller">
        {overflow.start && (
          <IconButton
            icon="chevronLeft"
            label="Ver filtros anteriores"
            variant="surface"
            size="sm"
            className="qa-filter-bar__arrow qa-filter-bar__arrow--start"
            onClick={() => scrollChips(-1)}
          />
        )}
        <div className="qa-filter-bar__chips" ref={chipsRef}>
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
        {overflow.end && (
          <IconButton
            icon="chevronRight"
            label="Ver mais filtros rápidos"
            variant="surface"
            size="sm"
            className="qa-filter-bar__arrow qa-filter-bar__arrow--end"
            onClick={() => scrollChips(1)}
          />
        )}
      </div>
      <Chip icon="sliders" onClick={onMoreFilters} aria-haspopup="dialog">
        Mais filtros
        {activeCount > 0 && (
          <span className="qa-visually-hidden">
            {" "}
            ({activeCount} {activeCount === 1 ? "ativo" : "ativos"})
          </span>
        )}
      </Chip>
      {trailing}
    </section>
  );
}
