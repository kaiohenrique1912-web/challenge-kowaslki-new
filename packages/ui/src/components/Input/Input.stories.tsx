import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input.tsx";

const meta = {
  title: "Base/Input",
  component: Input,
  args: { label: "Mínimo", prefix: "R$", placeholder: "0", inputMode: "numeric" },
  decorators: [(Story) => <div style={{ width: 260 }}>{Story()}</div>],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Money: Story = { args: { defaultValue: "500.000" } };
export const Area: Story = {
  args: { label: "Área mínima", prefix: undefined, suffix: "m²", defaultValue: "60" },
};
export const WithHint: Story = { args: { hint: "Valor do imóvel, sem centavos." } };
export const WithError: Story = {
  args: {
    label: "Máximo",
    defaultValue: "100.000",
    error: "Valor do imóvel: o valor mínimo não pode ser maior que o máximo.",
  },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: "500.000" } };
export const SearchPill: Story = {
  args: {
    label: "Localização",
    hideLabel: true,
    prefix: undefined,
    icon: "location",
    appearance: "pill",
    placeholder: "Rua, bairro ou código",
    inputMode: "search",
  },
  decorators: [(Story) => <div style={{ width: 380 }}>{Story()}</div>],
};
