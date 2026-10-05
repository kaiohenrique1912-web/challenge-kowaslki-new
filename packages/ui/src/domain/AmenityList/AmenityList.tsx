import { Tag } from "../../components/Tag/Tag.tsx";
import { cx } from "../../utils/cx.ts";
import "./AmenityList.css";

type AmenityItem = { code: string; label: string };

export type AmenityListProps = {
  /** Comodidades do imóvel (`Property.amenities`). */
  available: readonly AmenityItem[];
  /** Aplicáveis ao tipo e ausentes (`Property.unavailableAmenities`). */
  unavailable: readonly AmenityItem[];
  /** Quantos indisponíveis mostrar (a lista completa é longa). */
  unavailableLimit?: number;
  className?: string;
};

/** "Itens disponíveis" (✓) × "Itens indisponíveis" (riscados), como no detalhe do original. */
export function AmenityList({
  available,
  unavailable,
  unavailableLimit = 12,
  className,
}: AmenityListProps) {
  return (
    <div className={cx("qa-amenity-list", className)}>
      <section>
        <h3 className="qa-amenity-list__title">Itens disponíveis</h3>
        {available.length === 0 ? (
          <p className="qa-amenity-list__empty">Nenhum item informado.</p>
        ) : (
          <ul className="qa-amenity-list__items">
            {available.map((a) => (
              <li key={a.code}>
                <Tag tone="available">{a.label}</Tag>
              </li>
            ))}
          </ul>
        )}
      </section>
      {unavailable.length > 0 && (
        <section>
          <h3 className="qa-amenity-list__title qa-amenity-list__title--muted">
            Itens indisponíveis
          </h3>
          <ul className="qa-amenity-list__items">
            {unavailable.slice(0, unavailableLimit).map((a) => (
              <li key={a.code}>
                <Tag tone="unavailable">{a.label}</Tag>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
