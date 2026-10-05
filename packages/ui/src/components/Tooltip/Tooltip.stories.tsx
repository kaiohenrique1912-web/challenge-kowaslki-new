import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "../IconButton/IconButton.tsx";
import { Tooltip } from "./Tooltip.tsx";

const meta = {
  title: "Base/Tooltip",
  component: Tooltip,
  args: {
    content: "Que tal salvar este imóvel? Crie listas dos seus imóveis preferidos.",
    children: <IconButton icon="heart" label="Favoritar" variant="surface" />,
  },
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ padding: "96px 160px" }}>{Story()}</div>],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Passe o mouse ou foque com Tab. */
export const OnHoverOrFocus: Story = {};
export const AlwaysOpen: Story = { args: { open: true } };
export const Bottom: Story = {
  args: { open: true, placement: "bottom", content: "IPTU mensal (anual ÷ 12)" },
};
