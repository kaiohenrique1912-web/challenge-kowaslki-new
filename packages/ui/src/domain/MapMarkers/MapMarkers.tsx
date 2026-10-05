import { cx } from "../../utils/cx.ts";
import "./MapMarkers.css";

export type MapClusterProps = {
  /** Quantidade de imóveis na célula. */
  count: number;
  /** Destaque (card correspondente sob o mouse ou cluster selecionado). */
  highlighted?: boolean;
  onClick?: () => void;
  className?: string;
};

/** Formata a contagem da bolha: 1.234 → "1,2 mil". */
export function formatClusterCount(count: number): string {
  if (count < 1_000) return String(count);
  return `${(count / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
}

/**
 * Bolha branca com o número de imóveis — o marcador do mapa (igual ao original, inclusive com
 * "1" no zoom de rua). Para o Leaflet, renderize com `renderToStaticMarkup` dentro de um DivIcon.
 */
export function MapCluster({ count, highlighted = false, onClick, className }: MapClusterProps) {
  const size = count >= 1_000 ? "lg" : count >= 100 ? "md" : "sm";
  const label = count === 1 ? "1 imóvel" : `${count.toLocaleString("pt-BR")} imóveis`;
  return (
    <button
      type="button"
      className={cx(
        "qa-map-cluster",
        `qa-map-cluster--${size}`,
        highlighted && "qa-map-cluster--highlighted",
        className,
      )}
      aria-label={count === 1 ? `${label} — ver imóvel` : `${label} — aproximar`}
      onClick={onClick}
    >
      {formatClusterCount(count)}
    </button>
  );
}

export type MapPinProps = { label?: string; className?: string };

/** Pino vermelho que marca o centro do local buscado. */
export function MapPin({ label = "Local buscado", className }: MapPinProps) {
  return (
    <span className={cx("qa-map-pin", className)} role="img" aria-label={label}>
      <svg viewBox="0 0 24 32" width="28" height="36" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 32 12 32s12-11.6 12-20.3C24 5.2 18.6 0 12 0z" />
        <circle cx="12" cy="11.5" r="4.5" fill="#fff" />
      </svg>
    </span>
  );
}
