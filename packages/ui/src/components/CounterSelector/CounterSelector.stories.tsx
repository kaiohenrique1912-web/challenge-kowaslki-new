import { MIN_COUNT_FILTER_MAX } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CounterSelector } from "./CounterSelector.tsx";

const meta = {
  title: "Base/CounterSelector",
  component: CounterSelector,
  args: {
    label: "Quartos",
    max: MIN_COUNT_FILTER_MAX.bedrooms,
    value: 3,
    onChange: () => {},
    allowAny: false,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <CounterSelector {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof CounterSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bedrooms: Story = {};
export const ParkingAny: Story = {
  args: {
    label: "Vagas de garagem",
    max: MIN_COUNT_FILTER_MAX.parkingSpaces,
    value: null,
    allowAny: true,
  },
};
export const Suites: Story = {
  args: { label: "Suítes", max: MIN_COUNT_FILTER_MAX.suites, value: 1, allowAny: true },
};
