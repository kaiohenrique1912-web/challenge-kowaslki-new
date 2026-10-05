import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TabBar } from "./TabBar.tsx";

const items = [
  { value: "rent", label: "Alugar" },
  { value: "buy", label: "Comprar" },
] as const;

const meta = {
  title: "Base/TabBar",
  component: TabBar,
  args: { label: "Tipo de negócio", items, value: "buy", onChange: () => {} },
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState<string>("buy");
    return <TabBar {...args} value={value} onChange={setValue} />;
  },
};
