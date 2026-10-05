import type { CSSProperties } from "react";
import { cx } from "../../utils/cx.ts";
import "./RangeSlider.css";

export type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  /** Rótulos acessíveis das duas alavancas. */
  minLabel?: string;
  maxLabel?: string;
  /** Texto lido pelo leitor de tela, ex.: v => "R$ 500.000". */
  formatValue?: (value: number) => string;
  disabled?: boolean;
  className?: string;
};

/**
 * Slider de faixa com duas alavancas — dois `<input type="range">` nativos sobrepostos
 * (teclado e leitores de tela funcionam sem código extra). As alavancas não se cruzam.
 */
export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  minLabel = "Valor mínimo",
  maxLabel = "Valor máximo",
  formatValue = String,
  disabled = false,
  className,
}: RangeSliderProps) {
  const [low, high] = value;
  const percent = (v: number) => ((v - min) / (max - min)) * 100;
  const style = {
    "--range-start": `${percent(low)}%`,
    "--range-end": `${percent(high)}%`,
  } as CSSProperties;
  return (
    <div className={cx("qa-range", disabled && "qa-range--disabled", className)} style={style}>
      <div className="qa-range__track" aria-hidden="true" />
      <input
        type="range"
        className="qa-range__input"
        min={min}
        max={max}
        step={step}
        value={low}
        disabled={disabled}
        aria-label={minLabel}
        aria-valuetext={formatValue(low)}
        onChange={(e) => onChange([Math.min(Number(e.target.value), high), high])}
      />
      <input
        type="range"
        className="qa-range__input"
        min={min}
        max={max}
        step={step}
        value={high}
        disabled={disabled}
        aria-label={maxLabel}
        aria-valuetext={formatValue(high)}
        onChange={(e) => onChange([low, Math.max(Number(e.target.value), low)])}
      />
    </div>
  );
}
