import {
  cloneElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useId,
  useState,
} from "react";
import { cx } from "../../utils/cx.ts";
import "./Tooltip.css";

type TriggerProps = {
  "aria-describedby"?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
};

export type TooltipProps = {
  content: ReactNode;
  /** Elemento focável que dispara o tooltip (botão, link…). */
  children: ReactElement<TriggerProps>;
  placement?: "top" | "bottom";
  /** Controle externo (ex.: dica de onboarding sempre visível); sem isso abre no hover/foco. */
  open?: boolean;
  className?: string;
};

/**
 * Balão escuro com texto curto. Abre no hover e no foco do teclado, fecha com Esc;
 * o gatilho recebe `aria-describedby`. Não coloque conteúdo interativo dentro.
 */
export function Tooltip({ content, children, placement = "top", open, className }: TooltipProps) {
  const id = useId();
  const [hovered, setHovered] = useState(false);
  const visible = open ?? hovered;
  const trigger = cloneElement(children, {
    "aria-describedby": visible ? id : undefined,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Escape") setHovered(false);
    },
  });
  return (
    <span className={cx("qa-tooltip", className)}>
      {trigger}
      {visible && (
        <span
          id={id}
          role="tooltip"
          className={cx("qa-tooltip__bubble", `qa-tooltip__bubble--${placement}`)}
        >
          {content}
        </span>
      )}
    </span>
  );
}
