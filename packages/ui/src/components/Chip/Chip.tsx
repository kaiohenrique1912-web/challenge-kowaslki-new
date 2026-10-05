import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./Chip.css";

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** Filtro ativo: fundo azul-claro e texto azul (ex.: "3+ quartos"). */
  selected?: boolean;
  /** Mostra a seta ▾ — o chip abre um menu/painel (barra de filtros). */
  hasMenu?: boolean;
  /** Menu aberto (gira a seta e define aria-expanded). */
  menuOpen?: boolean;
  icon?: IconName;
  /** Chip removível (filtros ativos sobre o mapa): renderiza um "×" separado. */
  onRemove?: () => void;
  removeLabel?: string;
  size?: "sm" | "md";
};

/**
 * Pílula clicável. Três usos:
 * - filtro rápido na barra (com `hasMenu`);
 * - opção alternável (`selected` + `aria-pressed`);
 * - filtro ativo removível (`onRemove`).
 */
export function Chip({
  children,
  selected = false,
  hasMenu = false,
  menuOpen = false,
  icon,
  onRemove,
  removeLabel,
  size = "md",
  type = "button",
  className,
  ...rest
}: ChipProps) {
  const classes = cx("qa-chip", `qa-chip--${size}`, selected && "qa-chip--selected", className);
  if (onRemove) {
    return (
      <span className={cx(classes, "qa-chip--removable")}>
        <span className="qa-chip__text">{children}</span>
        <button
          type="button"
          className="qa-chip__remove"
          aria-label={
            removeLabel ?? `Remover filtro ${typeof children === "string" ? children : ""}`.trim()
          }
          onClick={onRemove}
        >
          <Icon name="close" size={16} />
        </button>
      </span>
    );
  }
  return (
    <button
      type={type}
      className={classes}
      aria-pressed={hasMenu ? undefined : selected}
      aria-haspopup={hasMenu ? "dialog" : undefined}
      aria-expanded={hasMenu ? menuOpen : undefined}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} />}
      <span className="qa-chip__text">{children}</span>
      {hasMenu && <Icon name={menuOpen ? "chevronUp" : "chevronDown"} size={16} />}
    </button>
  );
}
