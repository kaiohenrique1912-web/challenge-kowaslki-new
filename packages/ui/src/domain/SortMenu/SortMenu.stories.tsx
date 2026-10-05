import type { SortOrder } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SortMenu } from "./SortMenu.tsx";

const meta = {
  title: "Domain/SortMenu",
  component: SortMenu,
  args: { value: "RELEVANCE", onChange: () => {} },
  decorators: [(Story) => <div style={{ minHeight: 320, paddingLeft: 200 }}>{Story()}</div>],
  render: function Render(args) {
    const [value, setValue] = useState<SortOrder>(args.value);
    return <SortMenu {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof SortMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clique para abrir; setas ↑ ↓ mudam a ordenação. */
export const Relevance: Story = {};
export const LowestPrice: Story = { args: { value: "PRICE_ASC" } };
