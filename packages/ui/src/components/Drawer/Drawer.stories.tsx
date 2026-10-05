import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button/Button.tsx";
import { CounterSelector } from "../CounterSelector/CounterSelector.tsx";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl.tsx";
import { Drawer } from "./Drawer.tsx";

function FiltersPreview() {
  const [business, setBusiness] = useState("buy");
  const [bedrooms, setBedrooms] = useState<number | null>(3);
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <SegmentedControl
        label="Tipo de negócio"
        options={[
          { value: "rent", label: "Alugar" },
          { value: "buy", label: "Comprar" },
        ]}
        value={business}
        onChange={setBusiness}
      />
      <CounterSelector
        label="Quartos"
        max={4}
        value={bedrooms}
        onChange={setBedrooms}
        allowAny={false}
      />
      <p style={{ color: "#5c5c5c" }}>
        (O painel completo é o componente FilterPanel, na Etapa 5.)
      </p>
    </div>
  );
}

const meta = {
  title: "Base/Drawer",
  component: Drawer,
  args: {
    open: true,
    onClose: () => {},
    title: "Filtros",
    hideTitle: true,
    children: <FiltersPreview />,
    footer: (
      <>
        <Button variant="link">Limpar</Button>
        <Button>Ver 13 imóveis</Button>
      </>
    ),
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open);
    return (
      <>
        <Button variant="secondary" iconLeft="sliders" onClick={() => setOpen(true)}>
          Mais filtros
        </Button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FiltersPanel: Story = {};
export const LoadingCount: Story = {
  args: {
    footer: (
      <>
        <Button variant="link">Limpar</Button>
        <Button loading>Ver imóveis</Button>
      </>
    ),
  },
};
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
