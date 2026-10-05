import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./Tag.tsx";

const meta = {
  title: "Base/Tag",
  component: Tag,
  args: { children: "Armários no quarto", tone: "available" },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {};
export const Unavailable: Story = { args: { tone: "unavailable", children: "Piscina privativa" } };
export const Attribute: Story = { args: { tone: "default", icon: "bed", children: "3 quartos" } };
export const AttributeList: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 160px)", gap: 16 }}>
      <Tag icon="area">90 m²</Tag>
      <Tag icon="bed">3 quartos</Tag>
      <Tag icon="bath">1 banheiro</Tag>
      <Tag icon="car">–</Tag>
    </div>
  ),
};
