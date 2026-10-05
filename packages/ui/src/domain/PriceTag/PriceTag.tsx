import { formatBRL, monthlyCostLabel } from "@qa/shared";
import { cx } from "../../utils/cx.ts";
import "./PriceTag.css";

export type PriceTagProps = {
  salePrice: number;
  /** Condomínio + IPTU mensal. */
  monthlyCost: number;
  /** Preço anterior (badge "Baixou o preço"): aparece riscado. */
  previousPrice?: number | null;
  /** sm: card da lista. lg: topo do detalhe. */
  size?: "sm" | "lg";
  className?: string;
};

/** Preço de venda em destaque + linha "Condo. + IPTU R$ X" (business-rules §6.2). */
export function PriceTag({
  salePrice,
  monthlyCost,
  previousPrice,
  size = "sm",
  className,
}: PriceTagProps) {
  const dropped = previousPrice != null && previousPrice > salePrice;
  return (
    <div className={cx("qa-price", `qa-price--${size}`, className)}>
      {dropped && (
        <span className="qa-price__previous">
          <span className="qa-visually-hidden">Preço anterior: </span>
          <s>{formatBRL(previousPrice)}</s>
        </span>
      )}
      <span className="qa-price__sale">
        <span className="qa-visually-hidden">Valor de venda: </span>
        {formatBRL(salePrice)}
      </span>
      <span className="qa-price__monthly">{monthlyCostLabel(monthlyCost)}</span>
    </div>
  );
}
