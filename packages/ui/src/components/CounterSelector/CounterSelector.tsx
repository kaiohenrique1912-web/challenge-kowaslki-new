import { useId } from "react";
import { cx } from "../../utils/cx.ts";
import { useRadioGroup } from "../../utils/use-radio-group.ts";
import "./CounterSelector.css";

export type CounterSelectorProps = {
  /** Título da seção (ex.: "Quartos"). */
  label: string;
  /** Maior valor oferecido: 4 → "1+ 2+ 3+ 4+". */
  max: number;
  /** null = "Tanto faz". */
  value: number | null;
  onChange: (value: number | null) => void;
  /** Mostra a opção "Tanto faz" (o original mostra em vagas e suítes, não em quartos). */
  allowAny?: boolean;
  anyLabel?: string;
  className?: string;
};

/** Pílulas de mínimo "1+ … N+" (quartos, banheiros, suítes, vagas). Escolha única. */
export function CounterSelector({
  label,
  max,
  value,
  onChange,
  allowAny = true,
  anyLabel = "Tanto faz",
  className,
}: CounterSelectorProps) {
  const labelId = useId();
  const numbers = Array.from({ length: max }, (_, i) => i + 1);
  const options: (number | null)[] = allowAny ? [null, ...numbers] : numbers;
  const { itemProps } = useRadioGroup(options, value, onChange);
  return (
    <div className={cx("qa-counter", className)}>
      <span id={labelId} className="qa-counter__label">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="qa-counter__options">
        {options.map((option, index) => (
          <button
            key={option ?? "any"}
            type="button"
            className={cx("qa-counter__option", option === null && "qa-counter__option--any")}
            aria-label={option === null ? anyLabel : `${option} ou mais`}
            {...itemProps(index)}
          >
            {option === null ? anyLabel : `${option}+`}
          </button>
        ))}
      </div>
    </div>
  );
}
