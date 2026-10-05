import { SORT_ORDER_LABELS, SORT_ORDERS, type SortOrder } from "@qa/shared";
import { type KeyboardEvent, useState } from "react";
import { Button } from "../../components/Button/Button.tsx";
import { Popover } from "../../components/Popover/Popover.tsx";
import { Icon } from "../../icons/Icon.tsx";
import "./SortMenu.css";

export type SortMenuProps = {
  value: SortOrder;
  onChange: (sort: SortOrder) => void;
  /** Ordenações oferecidas (padrão: todas, na ordem do original). */
  options?: readonly SortOrder[];
  className?: string;
};

/** ↓/↑ movem o foco entre as opções (sem escolher); Enter/Espaço/clique escolhe e fecha. */
function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
  const index = items.indexOf(document.activeElement as HTMLButtonElement);
  const next = event.key === "ArrowDown" ? index + 1 : index - 1;
  items[(next + items.length) % items.length]?.focus();
}

/** Botão "Mais relevantes ▾" que abre a lista de ordenações (business-rules §4.2). */
export function SortMenu({ value, onChange, options = SORT_ORDERS, className }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      label="Ordenar por"
      width={260}
      align="end"
      className={className}
      anchor={
        <Button
          variant="secondary"
          size="sm"
          iconLeft="sort"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="qa-visually-hidden">Ordenar por: </span>
          {SORT_ORDER_LABELS[value]}
        </Button>
      }
    >
      <div role="menu" aria-label="Ordenar por" className="qa-sort-menu" onKeyDown={moveFocus}>
        {options.map((sort) => (
          <button
            key={sort}
            type="button"
            role="menuitemradio"
            aria-checked={sort === value}
            className="qa-sort-menu__option"
            onClick={() => {
              onChange(sort);
              setOpen(false);
            }}
          >
            {SORT_ORDER_LABELS[sort]}
            {sort === value && <Icon name="check" size={18} />}
          </button>
        ))}
      </div>
    </Popover>
  );
}
