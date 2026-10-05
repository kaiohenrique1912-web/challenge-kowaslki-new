import type { Meta, StoryObj } from "@storybook/react-vite";
import { AddressCard } from "./AddressCard.tsx";

const meta = {
  title: "Domain/AddressCard",
  component: AddressCard,
  args: {
    street: "Rua Cônego Vicente Miguel Marino",
    place: "Barra Funda, São Paulo",
    onClick: () => {},
  },
  decorators: [(Story) => <div style={{ width: 720 }}>{Story()}</div>],
} satisfies Meta<typeof AddressCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
