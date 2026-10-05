import type { Meta, StoryObj } from "@storybook/react-vite";
import { PriceTag } from "./PriceTag.tsx";

const meta = {
  title: "Domain/PriceTag",
  component: PriceTag,
  args: { salePrice: 1_555_000, monthlyCost: 2_350 },
} satisfies Meta<typeof PriceTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {};
export const Detail: Story = { args: { size: "lg" } };
export const PriceDrop: Story = { args: { previousPrice: 1_690_000 } };
export const NoCondoNoIptu: Story = { args: { salePrice: 320_000, monthlyCost: 0 } };
