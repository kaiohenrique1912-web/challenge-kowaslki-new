import type { MouseEvent, ReactNode } from "react";
import { cx } from "../../utils/cx.ts";
import "./AppHeader.css";

export type AppHeaderLink = { label: string; href: string; active?: boolean };

export type AppHeaderProps = {
  brand?: string;
  homeHref?: string;
  links?: readonly AppHeaderLink[];
  /** Intercepta a navegação dos links (ex.: React Router). */
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  /** Conteúdo à direita (ex.: botão "Entrar", contador de favoritos). */
  actions?: ReactNode;
  className?: string;
};

/** Cabeçalho do site: marca, navegação principal e ações. */
export function AppHeader({
  brand = "QuintoAndar",
  homeHref = "/",
  links = [],
  onNavigate,
  actions,
  className,
}: AppHeaderProps) {
  return (
    <header className={cx("qa-app-header", className)}>
      <a
        href={homeHref}
        className="qa-app-header__brand"
        onClick={(e) => onNavigate?.(e, homeHref)}
      >
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          aria-hidden="true"
          className="qa-app-header__logo"
        >
          <path d="M4 4h16v16h-6l-3-3h6V7H7v13H4z" />
        </svg>
        <span>{brand}</span>
      </a>
      {links.length > 0 && (
        <nav aria-label="Principal" className="qa-app-header__nav">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className="qa-app-header__link"
              onClick={(e) => onNavigate?.(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
      {actions && <div className="qa-app-header__actions">{actions}</div>}
    </header>
  );
}
