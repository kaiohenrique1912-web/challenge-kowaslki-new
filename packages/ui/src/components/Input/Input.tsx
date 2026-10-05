import { type InputHTMLAttributes, type ReactNode, useId } from "react";
import { Icon, type IconName } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./Input.css";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "size"> & {
  /** Rótulo visível (obrigatório por acessibilidade; use `hideLabel` para escondê-lo). */
  label: string;
  hideLabel?: boolean;
  /** Texto antes do valor, ex.: "R$". */
  prefix?: ReactNode;
  /** Texto depois do valor, ex.: "m²". */
  suffix?: ReactNode;
  icon?: IconName;
  hint?: string;
  /** Mensagem de erro — marca o campo como inválido e é lida pelo leitor de tela. */
  error?: string;
  /** Marca como inválido sem mensagem própria (a mensagem fica no grupo, ex.: RangeField). */
  invalid?: boolean;
  /** pill: campo arredondado cinza (busca da barra de filtros). */
  appearance?: "outline" | "pill";
};

export function Input({
  label,
  hideLabel = false,
  prefix,
  suffix,
  icon,
  hint,
  error,
  invalid = false,
  appearance = "outline",
  id,
  className,
  disabled,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const isInvalid = invalid || Boolean(error);
  return (
    <div
      className={cx(
        "qa-input",
        isInvalid && "qa-input--error",
        disabled && "qa-input--disabled",
        className,
      )}
    >
      <label htmlFor={inputId} className={cx("qa-input__label", hideLabel && "qa-visually-hidden")}>
        {label}
      </label>
      <div className={cx("qa-input__control", `qa-input__control--${appearance}`)}>
        {icon && <Icon name={icon} className="qa-input__icon" />}
        {prefix && <span className="qa-input__affix">{prefix}</span>}
        <input
          id={inputId}
          className="qa-input__field"
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          {...rest}
        />
        {suffix && <span className="qa-input__affix">{suffix}</span>}
      </div>
      {error ? (
        <p id={errorId} className="qa-input__message qa-input__message--error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="qa-input__message">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
