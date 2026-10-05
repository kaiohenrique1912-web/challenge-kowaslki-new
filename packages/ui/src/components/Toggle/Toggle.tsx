import { type ButtonHTMLAttributes, useId } from "react";
import { cx } from "../../utils/cx.ts";
import "./Toggle.css";

export type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
};

/** Interruptor liga/desliga (ex.: "Buscar ao mover o mapa"). `role="switch"`, Espaço/Enter alternam. */
export function Toggle({
  label,
  checked,
  onChange,
  description,
  className,
  disabled,
  ...rest
}: ToggleProps) {
  const id = useId();
  return (
    <div className={cx("qa-toggle", disabled && "qa-toggle--disabled", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
        className="qa-toggle__switch"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        {...rest}
      >
        <span className="qa-toggle__thumb" aria-hidden="true" />
      </button>
      <label htmlFor={id} className="qa-toggle__text">
        <span id={`${id}-label`} className="qa-toggle__label">
          {label}
        </span>
        {description && (
          <span id={`${id}-description`} className="qa-toggle__description">
            {description}
          </span>
        )}
      </label>
    </div>
  );
}
