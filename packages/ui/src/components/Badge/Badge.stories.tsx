import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge.tsx";

const meta = {
  title: "Base/Badge",
  component: Badge,
  args: { children: "Imóvel 1601406" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const OverPhoto: Story = {
  args: { tone: "overlay", children: "Exclusivo" },
  decorators: [
    (Story) => (
      <div style={{ background: "#8d6346", padding: 24, borderRadius: 12 }}>{Story()}</div>
    ),
  ],
};
export const Primary: Story = { args: { tone: "primary", children: "Novo" } };
export const Success: Story = { args: { tone: "success", children: "Ótimo preço" } };
export const Danger: Story = { args: { tone: "danger", children: "Indisponível" } };
