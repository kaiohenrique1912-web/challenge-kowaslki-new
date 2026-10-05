/**
 * Tokens do design system — FONTE ÚNICA. `tokens.css` é gerado a partir daqui com
 * `bun run tokens` (dentro de packages/ui); um teste garante que os dois estão iguais.
 * Valores inspirados nos prints do QuintoAndar em docs/reference/.
 * Uso em CSS: `var(--qa-color-primary)`. Uso em TS: `tokens.color.primary`.
 */

export const tokens = {
  color: {
    primary: "#3b5bc2",
    primaryHover: "#2f4aa3",
    primaryPressed: "#263d88",
    primarySubtle: "#eef1fc",
    primaryBorder: "#c4cff2",
    onPrimary: "#ffffff",

    text: "#1f1f1f",
    textMuted: "#5c5c5c",
    textSubtle: "#8a8a8a",
    textInverse: "#ffffff",

    surface: "#ffffff",
    surfaceMuted: "#f3f3f3",
    surfaceHover: "#e8e8e8",
    surfaceInverse: "#1f1f1f",
    overlay: "rgb(0 0 0 / 0.45)",

    border: "#d9d9d9",
    borderStrong: "#b3b3b3",
    divider: "#ebebeb",

    danger: "#d93a3a",
    dangerSubtle: "#fdecec",
    success: "#1f8a4c",
    successSubtle: "#e7f5ec",
    warning: "#b26a00",

    favorite: "#e0245e",
    mapPin: "#e8423f",
    skeleton: "#ececec",
    skeletonHighlight: "#f6f6f6",
  },

  font: {
    family: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },

  fontSize: {
    xs: "0.75rem", // 12px — badges, legendas
    sm: "0.875rem", // 14px — texto de apoio, chips, endereço
    md: "1rem", // 16px — texto padrão
    lg: "1.125rem", // 18px — preço no card
    xl: "1.5rem", // 24px — títulos de seção
    "2xl": "2rem", // 32px — preço no detalhe
    "3xl": "2.75rem", // 44px — título hero
  },

  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  lineHeight: {
    tight: "1.2",
    normal: "1.45",
  },

  space: {
    "0": "0",
    "1": "0.25rem", // 4px
    "2": "0.5rem", // 8px
    "3": "0.75rem", // 12px
    "4": "1rem", // 16px
    "5": "1.25rem", // 20px
    "6": "1.5rem", // 24px
    "8": "2rem", // 32px
    "10": "2.5rem", // 40px
    "12": "3rem", // 48px
    "16": "4rem", // 64px
  },

  radius: {
    sm: "4px",
    md: "8px", // inputs, badges
    lg: "12px", // cards, fotos
    xl: "16px", // modais, painéis
    pill: "999px", // botões, chips
  },

  shadow: {
    sm: "0 1px 2px rgb(0 0 0 / 0.08)",
    md: "0 4px 16px rgb(0 0 0 / 0.12)",
    lg: "0 12px 40px rgb(0 0 0 / 0.18)",
    map: "0 2px 6px rgb(0 0 0 / 0.25)",
  },

  /** Altura dos controles (botões, inputs, chips). */
  control: {
    sm: "2.25rem", // 36px
    md: "3rem", // 48px — chips da barra de filtros
  },

  zIndex: {
    dropdown: "100",
    sticky: "200",
    overlay: "900",
    modal: "1000",
    tooltip: "1100",
  },

  duration: {
    fast: "120ms",
    normal: "200ms",
  },

  focusRing: "0 0 0 3px rgb(59 91 194 / 0.4)",
} as const;

/** Breakpoints (min-width, px). CSS custom properties não funcionam em media queries, então
 * use estes valores literais nos @media e `breakpoints` no TS. */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type TokenGroup = { [key: string]: string | TokenGroup };

const kebab = (value: string) => value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Achata os tokens em pares `--qa-…: valor`. */
export function flattenTokens(group: TokenGroup = tokens, prefix = "--qa"): [string, string][] {
  return Object.entries(group).flatMap(([key, value]) =>
    typeof value === "string"
      ? [[`${prefix}-${kebab(key)}`, value] as [string, string]]
      : flattenTokens(value, `${prefix}-${kebab(key)}`),
  );
}

/** Conteúdo de tokens.css. */
export function renderTokensCss(): string {
  const lines = flattenTokens().map(([name, value]) => `  ${name}: ${value};`);
  const bp = Object.entries(breakpoints).map(([k, v]) => `  --qa-breakpoint-${k}: ${v}px;`);
  return [
    "/* GERADO por `bun run tokens` a partir de tokens.ts — não edite à mão. */",
    ":root {",
    ...lines,
    ...bp,
    "}",
    "",
  ].join("\n");
}
