import type { ReactNode } from "react";
import { cx } from "../../utils/cx.ts";
import "./Badge.css";

export type BadgeProps = {
  children: ReactNode;
  /**
   * overlay: branco com texto escuro, sobre fotos ("Exclusivo", "Baixou o preço").
   * neutral: cinza ("Imóvel 1601406"). primary/success/danger: estados.
   */
  tone?: "overlay" | "neutral" | "primary" | "success" | "danger";
  className?: string;
};

/** Etiqueta curta e não interativa. Para selos de imóvel use `PropertyBadges`. */
export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return <span className={cx("qa-badge", `qa-badge--${tone}`, className)}>{children}</span>;
}
