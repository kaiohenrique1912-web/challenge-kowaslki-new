import { countActiveFilters, type PropertyFilters } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../../components/Button/Button.tsx";
import { Drawer } from "../../components/Drawer/Drawer.tsx";
import { FilterPanel } from "./FilterPanel.tsx";

function InDrawer({ initial }: { initial: PropertyFilters }) {
  const [filters, setFilters] = useState(initial);
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="secondary" iconLeft="sliders" onClick={() => setOpen(true)}>
        Mais filtros ({countActiveFilters(filters)})
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filtros"
        hideTitle
        footer={
          <>
            <Button variant="link" onClick={() => setFilters({})}>
              Limpar
            </Button>
            <Button onClick={() => setOpen(false)}>Ver 1.234 imóveis</Button>
          </>
        }
      >
        <FilterPanel value={filters} onChange={setFilters} />
      </Drawer>
    </>
  );
}

const meta = {
  title: "Domain/FilterPanel",
  component: FilterPanel,
  args: { value: {}, onChange: () => {} },
  parameters: { layout: "padded" },
} satisfies Meta<typeof FilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: function Render() {
    const [filters, setFilters] = useState<PropertyFilters>({});
    return (
      <div style={{ width: 460 }}>
        <FilterPanel value={filters} onChange={setFilters} />
      </div>
    );
  },
};
export const InFiltersDrawer: Story = {
  render: () => (
    <InDrawer
      initial={{
        types: ["APARTMENT"],
        minBedrooms: 3,
        amenities: ["POOL"],
        price: { max: 900_000 },
      }}
    />
  ),
};
export const WithRangeError: Story = {
  render: () => <InDrawer initial={{ price: { min: 900_000, max: 300_000 } }} />,
};
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  render: () => <InDrawer initial={{}} />,
};
