import { AMENITIES, AMENITY_CATEGORY_LABELS } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox.tsx";

const meta = {
  title: "Base/Checkbox",
  component: Checkbox,
  args: { label: "Piscina" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const LongLabel: Story = {
  args: { label: "Quartos e corredores com portas amplas" },
  decorators: [(Story) => <div style={{ width: 200 }}>{Story()}</div>],
};

/** Grade de duas colunas, como a seção "Condomínio" do painel de filtros. */
export const AmenityGrid: Story = {
  render: () => (
    <fieldset style={{ border: "none", padding: 0, width: 460 }}>
      <legend style={{ fontWeight: 700, marginBottom: 16 }}>
        {AMENITY_CATEGORY_LABELS.CONDOMINIUM}
      </legend>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {AMENITIES.filter((a) => a.category === "CONDOMINIUM").map((a) => (
          <Checkbox key={a.code} label={a.label} />
        ))}
      </div>
    </fieldset>
  ),
};
