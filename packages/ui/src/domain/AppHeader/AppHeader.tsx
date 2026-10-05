import type { MouseEvent, ReactNode } from "react";
import { Icon } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./AppHeader.css";

/**
 * Item do menu principal. Com `href` vira link; sem `href`, botão (`onClick`) — usado para os
 * menus do original que estão fora do escopo (abrem um aviso). `menu` mostra a setinha ⌄.
 */
export type AppHeaderLink = {
  label: string;
  href?: string;
  active?: boolean;
  menu?: boolean;
  onClick?: () => void;
};

export type AppHeaderProps = {
  brand?: string;
  homeHref?: string;
  links?: readonly AppHeaderLink[];
  /** Intercepta a navegação dos links (ex.: React Router). */
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  /** Só o símbolo do logo, sem o nome (cabeçalho da página do imóvel). */
  compactBrand?: boolean;
  /** Conteúdo logo depois do logo (ex.: busca "Rua, bairro ou código" no detalhe). */
  search?: ReactNode;
  /** Conteúdo à direita (ex.: favoritos e "Entrar"). */
  actions?: ReactNode;
  className?: string;
};

/** Logo do QuintoAndar: quadrado aberto com a "dobra" no canto inferior direito. */
function Logo() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="32"
      height="32"
      aria-hidden="true"
      className="qa-app-header__logo"
    >
      <path d="M3 3h26v26h-8.5l-4-4H25V7H7v22H3z" />
      <path d="M15.5 17.5l4-4 9.5 9.5v6h-1.5z" />
    </svg>
  );
}

/** Cabeçalho do site: marca, menu principal e ações (no estilo do original). */
export function AppHeader({
  brand = "QuintoAndar",
  homeHref = "/",
  links = [],
  onNavigate,
  compactBrand = false,
  search,
  actions,
  className,
}: AppHeaderProps) {
  return (
    <header className={cx("qa-app-header", className)}>
      <a
        href={homeHref}
        className="qa-app-header__brand"
        aria-label={compactBrand ? `${brand} — início` : undefined}
        onClick={(e) => onNavigate?.(e, homeHref)}
      >
        <Logo />
        {!compactBrand && <span>{brand}</span>}
      </a>
      {search && <div className="qa-app-header__search">{search}</div>}
      {links.length > 0 && (
        <nav aria-label="Principal" className="qa-app-header__nav">
          {links.map((link) => {
            const content = (
              <>
                {link.label}
                {link.menu && <Icon name="chevronDown" size={16} />}
              </>
            );
            const { href } = link;
            return href ? (
              <a
                key={link.label}
                href={href}
                aria-current={link.active ? "page" : undefined}
                className="qa-app-header__link"
                onClick={(e) => onNavigate?.(e, href)}
              >
                {content}
              </a>
            ) : (
              <button
                key={link.label}
                type="button"
                className="qa-app-header__link"
                onClick={link.onClick}
              >
                {content}
              </button>
            );
          })}
        </nav>
      )}
      {actions && <div className="qa-app-header__actions">{actions}</div>}
    </header>
  );
}
