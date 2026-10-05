import { cx } from "../../utils/cx.ts";
import { useRadioGroup } from "../../utils/use-radio-group.ts";
import "./SegmentedControl.css";

export type SegmentedOption<T extends string> = { value: T; label: string };

export type SegmentedControlProps<T extends string> = {
  /** Nome acessível do grupo (ex.: "Tipo de negócio"). */
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
};

/** Alternância entre 2–4 opções exclusivas, ex.: "Alugar | Comprar", "Lista | Mapa". */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  const values = options.map((o) => o.value);
  const { itemProps } = useRadioGroup(values, value, onChange);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx("qa-segmented", `qa-segmented--${size}`, className)}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          className="qa-segmented__option"
          {...itemProps(index)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
