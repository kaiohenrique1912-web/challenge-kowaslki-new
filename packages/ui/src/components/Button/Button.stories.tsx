import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button.tsx";

const meta = {
  title: "Base/Button",
  component: Button,
  args: { children: "Buscar imóveis" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "outline", "link"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = {
  args: { variant: "secondary", children: "Mais relevantes", iconLeft: "sort" },
};
export const Outline: Story = { args: { variant: "outline", children: "Converse conosco agora" } };
export const Link: Story = { args: { variant: "link", children: "Limpar" } };
export const Small: Story = { args: { size: "sm" } };
export const WithIcon: Story = {
  args: { variant: "secondary", iconLeft: "sliders", children: "Mais filtros" },
};
export const Loading: Story = { args: { loading: true, children: "Ver 13 imóveis" } };
export const Disabled: Story = { args: { disabled: true } };
export const FullWidthMobile: Story = {
  args: { fullWidth: true, children: "Ver 13 imóveis" },
  parameters: { layout: "padded" },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
