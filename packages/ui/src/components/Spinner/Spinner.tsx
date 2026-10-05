import { cx } from "../../utils/cx.ts";
import "./Spinner.css";

export type SpinnerProps = {
  size?: number;
  /** Texto para leitores de tela. */
  label?: string;
  className?: string;
};

/** Indicador de carregamento circular. Herda a cor do texto (`currentColor`). */
export function Spinner({ size = 20, label = "Carregando", className }: SpinnerProps) {
  return (
    <span
      role="status"
      className={cx("qa-spinner", className)}
      style={{ width: size, height: size }}
    >
      <span className="qa-visually-hidden">{label}</span>
    </span>
  );
}
