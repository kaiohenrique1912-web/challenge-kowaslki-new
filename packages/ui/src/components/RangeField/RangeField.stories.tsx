import { formatBRL, searchFiltersSchema } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RangeField, type RangeValue } from "./RangeField.tsx";

/** Erro calculado com a MESMA validação da API (`searchFiltersSchema` de @qa/shared). */
function priceError(value: RangeValue): string | undefined {
  const result = searchFiltersSchema.safeParse({ price: value });
  return result.success ? undefined : result.error.issues[0]?.message;
}

const meta = {
  title: "Base/RangeField",
  component: RangeField,
  args: {
    label: "Valor do imóvel",
    value: { min: 500_000, max: 2_000_000 },
    onChange: () => {},
    sliderMin: 0,
    sliderMax: 5_000_000,
    step: 50_000,
    prefix: "R$",
    formatValue: formatBRL,
  },
  decorators: [(Story) => <div style={{ width: 460 }}>{Story()}</div>],
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <RangeField
        {...args}
        value={value}
        onChange={setValue}
        error={args.error ?? priceError(value)}
      />
    );
  },
} satisfies Meta<typeof RangeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Price: Story = {};
export const OpenEnded: Story = { args: { value: { min: null, max: null } } };
export const MinGreaterThanMax: Story = { args: { value: { min: 900_000, max: 500_000 } } };
export const AreaWithoutSlider: Story = {
  args: {
    label: "Área",
    value: { min: 60, max: null },
    prefix: undefined,
    suffix: "m²",
    showSlider: false,
    sliderMax: 1_000,
  },
};
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  decorators: [(Story) => <div style={{ width: "100%" }}>{Story()}</div>],
};
