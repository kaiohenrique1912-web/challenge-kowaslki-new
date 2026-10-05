import { type SelectHTMLAttributes, useId } from "react";
import { Icon } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./Select.css";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label: string;
  hideLabel?: boolean;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
};

/** Select nativo estilizado — mantém teclado e leitores de tela do navegador. */
export function Select({
  label,
  hideLabel = false,
  options,
  placeholder,
  error,
  id,
  className,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = error ? `${selectId}-error` : undefined;
  return (
    <div className={cx("qa-select", error && "qa-select--error", className)}>
      <label
        htmlFor={selectId}
        className={cx("qa-select__label", hideLabel && "qa-visually-hidden")}
      >
        {label}
      </label>
      <div className="qa-select__control">
        <select
          id={selectId}
          className="qa-select__field"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" className="qa-select__chevron" />
      </div>
      {error && (
        <p id={errorId} className="qa-select__error">
          {error}
        </p>
      )}
    </div>
  );
}
