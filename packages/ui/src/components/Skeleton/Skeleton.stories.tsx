import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton.tsx";

const meta = {
  title: "Base/Skeleton",
  component: Skeleton,
  args: { width: 240 },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextLine: Story = {};
export const Photo: Story = { args: { shape: "rect", width: 280, height: 186 } };
export const Circle: Story = { args: { shape: "circle", width: 48 } };
export const Paragraph: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8, width: 280 }}>
      <Skeleton width="60%" />
      <Skeleton width="90%" />
      <Skeleton width="75%" />
    </div>
  ),
};
