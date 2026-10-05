import { SORT_ORDER_LABELS, SORT_ORDERS } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select.tsx";

const sortOptions = SORT_ORDERS.map((value) => ({ value, label: SORT_ORDER_LABELS[value] }));

const meta = {
  title: "Base/Select",
  component: Select,
  args: { label: "Ordenar por", options: sortOptions, defaultValue: "RELEVANCE" },
  decorators: [(Story) => <div style={{ width: 280 }}>{Story()}</div>],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithPlaceholder: Story = {
  args: {
    label: "Bairro",
    placeholder: "Selecione um bairro",
    defaultValue: "",
    options: [
      { value: "pinheiros", label: "Pinheiros" },
      { value: "moema", label: "Moema" },
    ],
  },
};
export const WithError: Story = { args: { error: "Escolha uma ordenação." } };
export const Disabled: Story = { args: { disabled: true } };
