import { Icon } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./AddressCard.css";

export type AddressCardProps = {
  street: string;
  /** "Barra Funda, São Paulo". */
  place: string;
  /** Clique leva ao mapa da localização. */
  onClick?: () => void;
  className?: string;
};

/** Endereço público (sem número) com seta para o mapa — topo do detalhe. */
export function AddressCard({ street, place, onClick, className }: AddressCardProps) {
  return (
    <button
      type="button"
      className={cx("qa-address-card", className)}
      onClick={onClick}
      aria-label={`${street}, ${place} — ver no mapa`}
    >
      <span className="qa-address-card__text">
        <span className="qa-address-card__street">{street}</span>
        <span className="qa-address-card__place">{place}</span>
      </span>
      <Icon name="arrowRight" size={24} />
    </button>
  );
}
