import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import "./IconButton.css";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: IconName;
  /** Obrigatório: é o único texto acessível do botão. */
  label: string;
  /** surface: círculo branco com sombra (sobre fotos/mapa). ghost: sem fundo. muted: cinza. */
  variant?: "surface" | "ghost" | "muted";
  size?: "sm" | "md";
  filledIcon?: boolean;
};

export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  filledIcon = false,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        "qa-icon-button",
        `qa-icon-button--${variant}`,
        `qa-icon-button--${size}`,
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={size === "sm" ? 18 : 22} filled={filledIcon} />
    </button>
  );
}
