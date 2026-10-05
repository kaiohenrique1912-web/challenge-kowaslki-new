import type { CSSProperties } from "react";
import { cx } from "../../utils/cx.ts";
import "./Skeleton.css";

export type SkeletonProps = {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  /** text: barra de uma linha; rect: bloco (fotos); circle: avatar/ícone. */
  shape?: "text" | "rect" | "circle";
  className?: string;
};

/** Bloco cinza animado no lugar do conteúdo enquanto carrega. Decorativo (aria-hidden). */
export function Skeleton({ width = "100%", height, shape = "text", className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx("qa-skeleton", `qa-skeleton--${shape}`, className)}
      style={{ width, height: height ?? (shape === "text" ? "1em" : undefined) }}
    />
  );
}
