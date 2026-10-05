import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "./Breadcrumb.tsx";

const meta = {
  title: "Base/Breadcrumb",
  component: Breadcrumb,
  args: {
    items: [
      { label: "Início", href: "#" },
      { label: "São Paulo", href: "#sp" },
      { label: "Barra Funda", href: "#barra-funda" },
      { label: "Rua Cônego Vicente Miguel Marino", href: "#rua" },
      { label: "Imóvel 1601406" },
    ],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PropertyTrail: Story = {};
export const Short: Story = {
  args: { items: [{ label: "Início", href: "#" }, { label: "Favoritos" }] },
};
