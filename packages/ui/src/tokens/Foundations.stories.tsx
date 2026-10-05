import type { Meta, StoryObj } from "@storybook/react-vite";
import { breakpoints, tokens } from "./tokens.ts";

/** Página de referência dos tokens (gerada a partir de tokens.ts). */
const meta = {
  title: "Foundations/Tokens",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const label = { fontSize: 12, color: "#5c5c5c" } as const;

export const Colors: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 16,
      }}
    >
      {Object.entries(tokens.color).map(([name, value]) => (
        <div key={name} style={{ display: "grid", gap: 6 }}>
          <div
            style={{ height: 56, borderRadius: 8, background: value, border: "1px solid #ebebeb" }}
          />
          <code style={{ fontSize: 12 }}>--qa-color-{kebab(name)}</code>
          <span style={label}>{value}</span>
        </div>
      ))}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {Object.entries(tokens.fontSize)
        .reverse()
        .map(([name, value]) => (
          <div key={name} style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <code style={{ ...label, width: 140 }}>--qa-font-size-{name}</code>
            <span style={{ fontSize: value, fontWeight: 700 }}>R$ 1.555.000</span>
            <span style={label}>{value}</span>
          </div>
        ))}
      <p style={label}>Fonte: {tokens.font.family}</p>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      {Object.entries(tokens.space).map(([name, value]) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <code style={{ ...label, width: 120 }}>--qa-space-{name}</code>
          <div
            style={{ width: value, height: 16, background: tokens.color.primary, borderRadius: 2 }}
          />
          <span style={label}>{value}</span>
        </div>
      ))}
    </div>
  ),
};

export const RadiusAndShadow: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      {Object.entries(tokens.radius).map(([name, value]) => (
        <div key={name} style={{ display: "grid", gap: 6, justifyItems: "center" }}>
          <div
            style={{
              width: 96,
              height: 64,
              borderRadius: value,
              background: tokens.color.surfaceMuted,
            }}
          />
          <code style={label}>radius-{name}</code>
        </div>
      ))}
      {Object.entries(tokens.shadow).map(([name, value]) => (
        <div key={name} style={{ display: "grid", gap: 6, justifyItems: "center" }}>
          <div
            style={{
              width: 96,
              height: 64,
              borderRadius: 12,
              background: "#fff",
              boxShadow: value,
            }}
          />
          <code style={label}>shadow-{name}</code>
        </div>
      ))}
    </div>
  ),
};

export const Breakpoints: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse", fontSize: 14 }}>
      <tbody>
        {Object.entries(breakpoints).map(([name, px]) => (
          <tr key={name}>
            <td style={{ padding: "4px 16px 4px 0" }}>
              <code>{name}</code>
            </td>
            <td>≥ {px}px</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
