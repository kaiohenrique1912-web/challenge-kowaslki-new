import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chip } from "./Chip.tsx";

const meta = {
  title: "Base/Chip",
  component: Chip,
  args: { children: "Tipos de imóvel" },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const QuickFilterWithMenu: Story = { args: { hasMenu: true } };
export const ActiveFilter: Story = {
  args: { hasMenu: true, selected: true, children: "3+ quartos" },
};
export const MenuOpen: Story = { args: { hasMenu: true, menuOpen: true, children: "Valor" } };
export const WithIcon: Story = { args: { icon: "sliders", children: "Mais filtros" } };
export const Toggleable: Story = { args: { selected: true, children: "Apartamento", size: "sm" } };
export const Removable: Story = {
  args: { selected: true, children: "Total R$ 500 – R$ 5.000", onRemove: () => {} },
};
export const Disabled: Story = { args: { disabled: true } };
