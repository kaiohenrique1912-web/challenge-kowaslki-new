import type { ReactNode } from "react";
import { Icon, type IconName } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./Tag.css";

export type TagProps = {
  children: ReactNode;
  icon?: IconName;
  /** unavailable: item riscado/cinza ("Itens indisponíveis" no detalhe). */
  tone?: "default" | "available" | "unavailable";
  className?: string;
};

/** Item de lista com ícone, sem fundo — atributos e comodidades no detalhe ("✓ Varanda"). */
export function Tag({ children, icon, tone = "default", className }: TagProps) {
  const resolvedIcon =
    icon ?? (tone === "available" ? "check" : tone === "unavailable" ? "ban" : undefined);
  return (
    <span className={cx("qa-tag", `qa-tag--${tone}`, className)}>
      {resolvedIcon && <Icon name={resolvedIcon} size={18} />}
      {children}
      {tone === "unavailable" && <span className="qa-visually-hidden"> (indisponível)</span>}
    </span>
  );
}
