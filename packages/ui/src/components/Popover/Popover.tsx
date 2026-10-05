import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx.ts";
import "./Popover.css";

export type PopoverProps = {
  open: boolean;
  /** Pedido de fechamento (clique fora ou Esc). Quem abre é o próprio gatilho. */
  onClose: () => void;
  /** Elemento que abre o painel (ex.: Chip com `hasMenu`); o clique dele é do dono. */
  anchor: ReactNode;
  /** Nome acessível do painel. */
  label: string;
  children: ReactNode;
  /** Rodapé fixo (ex.: "Limpar" + "Ver 13 imóveis"). */
  footer?: ReactNode;
  width?: number;
  align?: "start" | "end";
  className?: string;
};

const GAP = 8;
const SAFE_MARGIN = 8;

/**
 * Painel flutuante ancorado num gatilho (filtros rápidos da barra, menu de ordenação).
 * Renderizado no `body` com posição fixa — não é cortado por containers com rolagem.
 * Fecha no clique fora e no Esc (devolvendo o foco ao gatilho); foca o 1º controle ao abrir.
 */
export function Popover({
  open,
  onClose,
  anchor,
  label,
  children,
  footer,
  width = 360,
  align = "start",
  className,
}: PopoverProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ visibility: "hidden" });
  const panelId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const place = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const maxLeft = window.innerWidth - width - SAFE_MARGIN;
    const left = align === "end" ? rect.right - width : rect.left;
    setStyle({
      top: rect.bottom + GAP,
      left: Math.max(SAFE_MARGIN, Math.min(left, maxLeft)),
      width,
      maxHeight: window.innerHeight - rect.bottom - GAP - SAFE_MARGIN,
    });
  }, [align, width]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>(
      "button:not([disabled]), input:not([disabled]), select, [tabindex='0']",
    );
    first?.focus();

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onCloseRef.current();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onCloseRef.current();
      anchorRef.current?.querySelector<HTMLElement>("button, a, input")?.focus();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const panel = open && (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-label={label}
      className={cx("qa-popover", className)}
      style={style}
    >
      <div className="qa-popover__body">{children}</div>
      {footer && <div className="qa-popover__footer">{footer}</div>}
    </div>
  );

  return (
    <>
      <span ref={anchorRef} className="qa-popover__anchor">
        {anchor}
      </span>
      {panel && (typeof document === "undefined" ? panel : createPortal(panel, document.body))}
    </>
  );
}
