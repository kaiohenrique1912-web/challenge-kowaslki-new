import type { ReactNode } from "react";
import { Skeleton } from "../../components/Skeleton/Skeleton.tsx";
import { cx } from "../../utils/cx.ts";
import "./ResultsHeader.css";

export type ResultsHeaderProps = {
  /** "7.887 Apartamentos" — use `searchResultsHeading` de @qa/shared. */
  title: string;
  /** "com 3 quartos à venda em Pinheiros, São Paulo, SP". */
  subtitle: string;
  /** Contagem ainda carregando: mostra skeleton no lugar do título. */
  loading?: boolean;
  /** À direita (ex.: SortMenu). */
  actions?: ReactNode;
  className?: string;
};

/** Cabeçalho da lista de resultados. O título é anunciado quando muda (aria-live). */
export function ResultsHeader({
  title,
  subtitle,
  loading = false,
  actions,
  className,
}: ResultsHeaderProps) {
  return (
    <div className={cx("qa-results-header", className)}>
      <div className="qa-results-header__text" aria-live="polite">
        {loading ? (
          <>
            <Skeleton width={160} height={24} />
            <Skeleton width={280} height={16} />
          </>
        ) : (
          <>
            <h1 className="qa-results-header__title">{title}</h1>
            <p className="qa-results-header__subtitle">{subtitle}</p>
          </>
        )}
      </div>
      {actions && <div className="qa-results-header__actions">{actions}</div>}
    </div>
  );
}
