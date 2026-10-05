import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SegmentedControl } from "./SegmentedControl.tsx";

const meta = {
  title: "Base/SegmentedControl",
  component: SegmentedControl,
  args: {
    label: "Tipo de negócio",
    options: [
      { value: "rent", label: "Alugar" },
      { value: "buy", label: "Comprar" },
    ],
    value: "buy",
    onChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <SegmentedControl {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof SegmentedControl<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BuyOrRent: Story = {};
export const ListOrMap: Story = {
  args: {
    label: "Visualização",
    options: [
      { value: "list", label: "Lista" },
      { value: "map", label: "Mapa" },
    ],
    value: "list",
    size: "sm",
  },
};
