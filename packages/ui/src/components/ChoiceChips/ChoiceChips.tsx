import { useId } from "react";
import { cx } from "../../utils/cx.ts";
import { useRadioGroup } from "../../utils/use-radio-group.ts";
import "../CounterSelector/CounterSelector.css";

export type ChoiceOption<T> = { value: T; label: string };

export type ChoiceChipsProps<T> = {
  /** Título da seção (ex.: "Mobiliado", "Data de publicação"). */
  label: string;
  options: readonly ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * Pílulas de escolha única com rótulo de texto — "Tanto faz · Sim · Não", "Hoje · Últimos 7
 * dias…". Mesmo visual do CounterSelector (que é a versão numérica "1+ 2+ 3+").
 */
export function ChoiceChips<T>({
  label,
  options,
  value,
  onChange,
  className,
}: ChoiceChipsProps<T>) {
  const labelId = useId();
  const values = options.map((o) => o.value);
  const { itemProps } = useRadioGroup(values, value, onChange);
  return (
    <div className={cx("qa-counter", className)}>
      <span id={labelId} className="qa-counter__label">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="qa-counter__options">
        {options.map((option, index) => (
          <button
            key={String(option.value)}
            type="button"
            className="qa-counter__option qa-counter__option--any"
            {...itemProps(index)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
