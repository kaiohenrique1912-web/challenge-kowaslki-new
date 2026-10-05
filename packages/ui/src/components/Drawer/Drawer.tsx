import { type DialogProps, DialogShell } from "../Modal/Modal.tsx";

export type DrawerProps = DialogProps & {
  side?: "left" | "right";
};

/** Painel lateral com rolagem e rodapé fixo — usado no "Mais filtros". Tela cheia no mobile. */
export function Drawer({ side = "right", ...props }: DrawerProps) {
  return <DialogShell {...props} kind="drawer" side={side} />;
}
