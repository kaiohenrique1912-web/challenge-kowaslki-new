import type { ReactNode } from "react";
import { Tooltip } from "../../components/Tooltip/Tooltip.tsx";
import { Icon } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./PriceSummary.css";

export type PriceSummaryRow = { label: string; value: string; hint?: string };

export type PriceSummaryProps = {
  /** Linhas (use `priceSummary` de @qa/shared: Venda, Condomínio, IPTU). */
  rows: readonly PriceSummaryRow[];
  /** Linha de destaque (ex.: "Condo. + IPTU R$ 2.350/mês"). */
  total: PriceSummaryRow;
  /** Informação extra abaixo do total (ex.: retorno estimado com aluguel). */
  note?: ReactNode;
  /** Ações principais (ex.: "Agendar visita", "Fazer proposta"). */
  actions?: ReactNode;
  /** Rodapé (ex.: Favoritar + Compartilhar). */
  footer?: ReactNode;
  className?: string;
};

/** Card de preços da lateral do detalhe (business-rules §6.2). */
export function PriceSummary({ rows, total, note, actions, footer, className }: PriceSummaryProps) {
  return (
    <aside className={cx("qa-price-summary", className)} aria-label="Valores do imóvel">
      <dl className="qa-price-summary__rows">
        {rows.map((row) => (
          <div key={row.label} className="qa-price-summary__row">
            <dt>
              {row.label}
              {row.hint && (
                <Tooltip content={row.hint} placement="bottom">
                  <button
                    type="button"
                    className="qa-price-summary__hint"
                    aria-label={`Sobre ${row.label}`}
                  >
                    <Icon name="info" size={16} />
                  </button>
                </Tooltip>
              )}
            </dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="qa-price-summary__total">
        <span>{total.label}</span>
        <strong>{total.value}</strong>
      </div>
      {note && <div className="qa-price-summary__note">{note}</div>}
      {actions && <div className="qa-price-summary__actions">{actions}</div>}
      {footer && <div className="qa-price-summary__footer">{footer}</div>}
    </aside>
  );
}
