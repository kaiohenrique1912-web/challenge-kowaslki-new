import { formatBRL } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RangeSlider } from "./RangeSlider.tsx";

const meta = {
  title: "Base/RangeSlider",
  component: RangeSlider,
  args: {
    min: 0,
    max: 5_000_000,
    step: 50_000,
    value: [500_000, 2_000_000],
    onChange: () => {},
    formatValue: formatBRL,
  },
  decorators: [(Story) => <div style={{ width: 420 }}>{Story()}</div>],
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <>
        <RangeSlider {...args} value={value} onChange={setValue} />
        <p style={{ fontSize: 14 }}>
          {formatBRL(value[0])} – {formatBRL(value[1])}
        </p>
      </>
    );
  },
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Price: Story = {};
export const Disabled: Story = { args: { disabled: true } };
