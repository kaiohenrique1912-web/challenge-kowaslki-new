import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../../icons/Icon.tsx";
import { cx } from "../../utils/cx.ts";
import { Spinner } from "../Spinner/Spinner.tsx";
import "./Button.css";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * primary: ação principal (azul, ex.: "Buscar imóveis", "Ver 13 imóveis").
   * secondary: ação de apoio (cinza, ex.: "Mais relevantes", "Fazer proposta").
   * outline: borda, fundo branco (ex.: "Converse conosco agora").
   * link: texto azul sem fundo (ex.: "Limpar", "Ver mais").
   * ghost: texto preto sem fundo, fundo cinza no hover (ex.: "Favoritos" no cabeçalho).
   */
  variant?: "primary" | "secondary" | "outline" | "link" | "ghost";
  size?: "sm" | "md";
  /** Mostra um spinner e bloqueia cliques; o texto continua lá (acessível). */
  loading?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled,
  iconLeft,
  iconRight,
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "qa-button",
        `qa-button--${variant}`,
        `qa-button--${size}`,
        fullWidth && "qa-button--full",
        loading && "qa-button--loading",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Spinner size={16} label="Carregando" />
      ) : (
        iconLeft && <Icon name={iconLeft} size={18} />
      )}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={18} />}
    </button>
  );
}
