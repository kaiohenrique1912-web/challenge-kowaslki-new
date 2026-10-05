import type { ReactNode } from "react";
import { Icon, type IconName } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./StatusMessage.css";

export type StatusMessageProps = {
  title: string;
  description?: ReactNode;
  icon?: IconName;
  /** Ação de saída (ex.: "Limpar filtros", "Tentar novamente"). */
  action?: ReactNode;
  /** error: anunciado imediatamente (role="alert"). neutral: role="status". */
  tone?: "neutral" | "error";
  className?: string;
};

/** Mensagem de estado vazio ou de erro, centralizada, com ação opcional. */
export function StatusMessage({
  title,
  description,
  icon,
  action,
  tone = "neutral",
  className,
}: StatusMessageProps) {
  const resolvedIcon = icon ?? (tone === "error" ? "alert" : "search");
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cx("qa-status", `qa-status--${tone}`, className)}
    >
      <span className="qa-status__icon" aria-hidden="true">
        <Icon name={resolvedIcon} size={28} />
      </span>
      <p className="qa-status__title">{title}</p>
      {description && <p className="qa-status__description">{description}</p>}
      {action && <div className="qa-status__action">{action}</div>}
    </div>
  );
}
