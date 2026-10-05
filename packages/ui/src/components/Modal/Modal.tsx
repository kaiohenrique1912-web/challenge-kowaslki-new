import { type ReactNode, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx.ts";
import { useDialog } from "../../utils/use-dialog.ts";
import { IconButton } from "../IconButton/IconButton.tsx";
import "./Modal.css";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** Título — vira o nome acessível do diálogo. */
  title: string;
  /** Esconde o título visualmente (continua acessível). */
  hideTitle?: boolean;
  children: ReactNode;
  /** Rodapé fixo (ex.: "Limpar" + "Ver 13 imóveis"). */
  footer?: ReactNode;
  className?: string;
};

type ShellProps = DialogProps & { kind: "modal" | "drawer"; side?: "left" | "right" };

/** Estrutura comum de Modal e Drawer: overlay, cabeçalho com ×, corpo rolável e rodapé. */
export function DialogShell({
  open,
  onClose,
  title,
  hideTitle = false,
  children,
  footer,
  className,
  kind,
  side = "right",
}: ShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialog(open, ref, onClose);
  if (!open) return null;

  const content = (
    <div
      className={cx("qa-dialog", `qa-dialog--${kind}`, kind === "drawer" && `qa-dialog--${side}`)}
    >
      <div className="qa-dialog__overlay" aria-hidden="true" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx("qa-dialog__panel", className)}
      >
        <header className="qa-dialog__header">
          <IconButton icon="close" label="Fechar" onClick={onClose} />
          <h2 id={titleId} className={cx("qa-dialog__title", hideTitle && "qa-visually-hidden")}>
            {title}
          </h2>
        </header>
        <div className="qa-dialog__body">{children}</div>
        {footer && <footer className="qa-dialog__footer">{footer}</footer>}
      </div>
    </div>
  );
  // Sem DOM (renderização no servidor/testes), renderiza no lugar.
  return typeof document === "undefined" ? content : createPortal(content, document.body);
}

/** Diálogo centralizado para confirmações e conteúdos curtos. */
export function Modal(props: DialogProps) {
  return <DialogShell {...props} kind="modal" />;
}
