import type { SVGProps } from "react";

/**
 * Ícones em SVG inline (traço de 1.75 px, 24×24), no estilo de linha fina do original.
 * Decorativos por padrão (aria-hidden); passe `title` quando o ícone for o único conteúdo.
 */

const PATHS = {
  heart:
    "M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.5 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.5 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z",
  close: "M6 6l12 12M18 6L6 18",
  chevronDown: "M6 9l6 6 6-6",
  chevronUp: "M6 15l6-6 6 6",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  location:
    "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  sliders: "M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4",
  sort: "M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4",
  share:
    "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4",
  check: "M5 12.5l4.5 4.5L19 7.5",
  minus: "M5 12h14",
  plus: "M12 5v14M5 12h14",
  bed: "M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3M7 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  area: "M3 9h18v6H3zM7 9v3M11 9v3M15 9v3M19 9v3",
  car: "M5 16h14v-4l-2-5H7l-2 5v4zM5 16v2M19 16v2M8 13h.01M16 13h.01",
  bath: "M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V6a2 2 0 0 1 4 0",
  draw: "M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2zM10 20a2 2 0 0 0 4 0",
  image: "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15.5 9.5h.01",
  map: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  alert: "M12 8v5M12 16h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  building: "M5 21V4h10v17M15 9h4v12M3 21h18M8 8h1M11 8h1M8 12h1M11 12h1M8 16h1M11 16h1",
  paw: "M8.5 8a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM15.5 8a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM5 12.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM19 12.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM12 12c-2.5 0-5 3.2-5 5.3 0 1.6 1.3 2.2 2.6 2.2 1 0 1.6-.5 2.4-.5s1.4.5 2.4.5c1.3 0 2.6-.6 2.6-2.2 0-2.1-2.5-5.3-5-5.3z",
  sofa: "M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 12a1.5 1.5 0 0 1 3 0v2h12v-2a1.5 1.5 0 0 1 3 0v5H3zM5 17v2M19 17v2",
  train:
    "M7 3h10a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2zM5 11h14M9 15h.01M15 15h.01M8 18l-2 3M16 18l2 3",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowLeft: "M19 12H5M11 6l-6 6 6 6",
  info: "M12 11v5M12 8h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
} as const;

export type IconName = keyof typeof PATHS;
export const ICON_NAMES = Object.keys(PATHS) as IconName[];

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
  size?: number;
  /** Rótulo acessível — só quando o ícone transmite informação sozinho. */
  title?: string;
  /** Preenche o desenho (ex.: coração de favorito marcado). */
  filled?: boolean;
};

export function Icon({ name, size = 20, title, filled = false, ...rest }: IconProps) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: sem `title` o ícone é decorativo (aria-hidden); com `title`, ganha <title> e role="img"
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title && <title>{title}</title>}
      <path d={PATHS[name]} />
    </svg>
  );
}
