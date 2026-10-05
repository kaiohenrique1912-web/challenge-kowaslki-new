import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Combobox, type ComboboxOption } from "./Combobox.tsx";

const ALL: ComboboxOption[] = [
  {
    id: "n:pinheiros",
    label: "Pinheiros, São Paulo – SP",
    description: "Bairro",
    icon: "location",
  },
  {
    id: "n:vila-madalena",
    label: "Vila Madalena, São Paulo – SP",
    description: "Bairro",
    icon: "location",
  },
  {
    id: "n:vila-mariana",
    label: "Vila Mariana, São Paulo – SP",
    description: "Bairro",
    icon: "location",
  },
  {
    id: "s:augusta",
    label: "Rua Augusta, Consolação – São Paulo",
    description: "Rua",
    icon: "map",
  },
];

function Demo({ initial = "", loading = false }: { initial?: string; loading?: boolean }) {
  const [value, setValue] = useState(initial);
  const [chosen, setChosen] = useState<string | null>(null);
  const term = value.toLowerCase();
  const options = ALL.filter((o) => o.label.toLowerCase().includes(term));
  return (
    <div style={{ width: 380, minHeight: 280 }}>
      <Combobox
        label="Localização"
        hideLabel
        icon="location"
        appearance="pill"
        placeholder="Rua, bairro ou código"
        value={value}
        onValueChange={setValue}
        options={options}
        loading={loading}
        onSelect={(o) => {
          setValue(o.label);
          setChosen(o.id);
        }}
      />
      {chosen && <p style={{ fontSize: 14 }}>Escolhido: {chosen}</p>}
    </div>
  );
}

const meta = {
  title: "Base/Combobox",
  component: Combobox,
  args: {
    label: "Localização",
    value: "",
    onValueChange: () => {},
    options: [],
    onSelect: () => {},
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Digite "vila" e use ↓ ↑ Enter. */
export const LocationSearch: Story = { render: () => <Demo /> };
export const Loading: Story = { render: () => <Demo initial="pin" loading /> };
export const NoResults: Story = { render: () => <Demo initial="atlântida" /> };
