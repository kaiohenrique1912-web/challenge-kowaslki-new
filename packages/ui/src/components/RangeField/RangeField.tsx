import { useId } from "react";
import { cx } from "../../utils/cx.ts";
import { Input } from "../Input/Input.tsx";
import { RangeSlider } from "../RangeSlider/RangeSlider.tsx";
import "./RangeField.css";

export type RangeValue = { min: number | null; max: number | null };

export type RangeFieldProps = {
  /** Título da seção, ex.: "Valor do imóvel". */
  label: string;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  /** Limites do slider (os campos de texto aceitam qualquer valor). */
  sliderMin: number;
  sliderMax: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  /** Formato para leitores de tela e para o slider, ex.: formatBRL. */
  formatValue?: (value: number) => string;
  /** Mensagem de erro (ex.: mínimo maior que o máximo, vinda da validação de `shared`). */
  error?: string;
  showSlider?: boolean;
  className?: string;
};

const parseDigits = (text: string): number | null => {
  const digits = text.replace(/\D/g, "");
  return digits === "" ? null : Number(digits);
};
const display = (value: number | null) => (value === null ? "" : value.toLocaleString("pt-BR"));

/**
 * Faixa "Mínimo / Máximo" com slider — Valor do imóvel, Condomínio + IPTU, Área.
 * Campo vazio = sem limite naquele lado (`null`).
 */
export function RangeField({
  label,
  value,
  onChange,
  sliderMin,
  sliderMax,
  step = 1,
  prefix,
  suffix,
  formatValue = (v) => v.toLocaleString("pt-BR"),
  error,
  showSlider = true,
  className,
}: RangeFieldProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const sliderValue: [number, number] = [
    Math.max(sliderMin, Math.min(value.min ?? sliderMin, sliderMax)),
    Math.max(sliderMin, Math.min(value.max ?? sliderMax, sliderMax)),
  ];
  return (
    <fieldset
      className={cx("qa-range-field", className)}
      aria-describedby={error ? errorId : undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="qa-range-field__legend">{label}</legend>
      <div className="qa-range-field__inputs">
        <Input
          label="Mínimo"
          prefix={prefix}
          suffix={suffix}
          inputMode="numeric"
          placeholder="Sem mínimo"
          value={display(value.min)}
          onChange={(e) => onChange({ ...value, min: parseDigits(e.target.value) })}
          invalid={Boolean(error)}
        />
        <Input
          label="Máximo"
          prefix={prefix}
          suffix={suffix}
          inputMode="numeric"
          placeholder="Sem máximo"
          value={display(value.max)}
          onChange={(e) => onChange({ ...value, max: parseDigits(e.target.value) })}
          invalid={Boolean(error)}
        />
      </div>
      {showSlider && (
        <RangeSlider
          min={sliderMin}
          max={sliderMax}
          step={step}
          value={sliderValue}
          formatValue={formatValue}
          minLabel={`${label}: mínimo`}
          maxLabel={`${label}: máximo`}
          onChange={([low, high]) =>
            onChange({
              min: low <= sliderMin ? null : low,
              max: high >= sliderMax ? null : high,
            })
          }
        />
      )}
      {error && (
        <p id={errorId} role="alert" className="qa-range-field__error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
