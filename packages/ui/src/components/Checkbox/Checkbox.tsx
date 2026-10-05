import { type InputHTMLAttributes, useId } from "react";
import { Icon } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./Checkbox.css";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

/** Checkbox nativo com visual próprio (lista de comodidades e tipos de imóvel). */
export function Checkbox({ label, id, className, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label
      htmlFor={inputId}
      className={cx("qa-checkbox", rest.disabled && "qa-checkbox--disabled", className)}
    >
      <input id={inputId} type="checkbox" className="qa-checkbox__input" {...rest} />
      <span className="qa-checkbox__box" aria-hidden="true">
        <Icon name="check" size={14} />
      </span>
      <span className="qa-checkbox__label">{label}</span>
    </label>
  );
}
