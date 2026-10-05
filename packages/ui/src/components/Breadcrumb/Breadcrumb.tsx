import type { MouseEvent } from "react";
import { Icon } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./Breadcrumb.css";

export type BreadcrumbItem = { label: string; href?: string };

export type BreadcrumbProps = {
  /** Do mais geral ao atual; o último é a página atual (sem link). */
  items: readonly BreadcrumbItem[];
  /** Intercepta a navegação (ex.: React Router). */
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  className?: string;
};

/** Trilha "Início › São Paulo › Pinheiros › Rua … › Imóvel 1601406". */
export function Breadcrumb({ items, onNavigate, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Trilha de navegação" className={cx("qa-breadcrumb", className)}>
      <ol className="qa-breadcrumb__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.href ?? "atual"}-${item.label}`} className="qa-breadcrumb__item">
              {item.href && !last ? (
                <a
                  href={item.href}
                  className="qa-breadcrumb__link"
                  onClick={(e) => onNavigate?.(e, item.href as string)}
                >
                  {item.label}
                </a>
              ) : (
                <span aria-current={last ? "page" : undefined} className="qa-breadcrumb__current">
                  {item.label}
                </span>
              )}
              {!last && <Icon name="chevronRight" size={16} className="qa-breadcrumb__separator" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
