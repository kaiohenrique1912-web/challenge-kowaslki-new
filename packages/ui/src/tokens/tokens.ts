/**
 * Tokens do design system — FONTE ÚNICA. `tokens.css` é gerado a partir daqui com
 * `bun run tokens` (dentro de packages/ui); um teste garante que os dois estão iguais.
 * Valores tirados do CSS público do QuintoAndar (tokens "tokens-base-*" do site) e conferidos
 * com os prints de docs/reference/ via `bun run visual`. A fonte original (Oatmeal Pro) é paga;
 * usamos Albert Sans, a gratuita mais parecida.
 * Uso em CSS: `var(--qa-color-primary)`. Uso em TS: `tokens.color.primary`.
 */

export const tokens = {
  color: {
    primary: "#3957bd", // blue-400
    primaryHover: "#1b43a6", // blue-500
    primaryPressed: "#07358f", // blue-600
    primarySubtle: "#f0f3ff", // blue-00 — chip/filtro selecionado
    primaryBorder: "#d2dbf8", // blue-50
    onPrimary: "#ffffff",

    text: "#000000",
    textMuted: "#575763", // blueGray-600 — texto de apoio
    textSubtle: "#737380", // blueGray-500
    textInverse: "#ffffff",

    surface: "#ffffff",
    surfaceMuted: "#f5f5f7", // blueGray-00 — chips, campos, hero do detalhe
    surfaceHover: "#e4e4e8", // blueGray-50
    surfaceInverse: "#000000",
    overlay: "rgb(0 0 0 / 0.5)",

    border: "#d7d7dd", // blueGray-100
    borderStrong: "#b9b9c3", // blueGray-200
    divider: "#e4e4e8",

    danger: "#b23f19", // red-400
    dangerSubtle: "#ffe9e6",
    success: "#407a40", // green-500
    successSubtle: "#ecf7eb",
    warning: "#b26a00",

    favorite: "#ea4e58", // pink-400
    mapPin: "#e8423f",
    skeleton: "#ececec",
    skeletonHighlight: "#f6f6f6",
  },

  font: {
    family:
      '"Albert Sans Variable", "Albert Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },

  fontSize: {
    // Escala do original: base 15px (não 16).
    xs: "0.75rem", // 12px — selos, legendas, texto dos chips
    sm: "0.8125rem", // 13px — título do card, trilha
    md: "0.9375rem", // 15px — texto padrão
    lg: "1.25rem", // 20px — preço no card, títulos de seção
    xl: "1.6667rem", // 26.7px — títulos de modal
    "2xl": "2.2208rem", // 35.5px — preço no detalhe
    "3xl": "2.96rem", // 47.4px — título hero
  },

  fontWeight: {
    // O original só usa 400 e 600; "bold" fica igual a "semibold" de propósito.
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "600",
  },

  letterSpacing: {
    tight: "-0.02em", // títulos
    tighter: "-0.035em", // títulos grandes (hero)
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
    md: "3rem", // 48px — botões
    lg: "3.5rem", // 56px — chips e campo de local da barra de filtros
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

  focusRing: "0 0 0 3px rgb(57 87 189 / 0.4)",
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
