import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button.tsx";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Buscar imóveis" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: "secondary", children: "Mais filtros" } };

export const Small: Story = { args: { size: "sm" } };

export const Disabled: Story = { args: { disabled: true } };
