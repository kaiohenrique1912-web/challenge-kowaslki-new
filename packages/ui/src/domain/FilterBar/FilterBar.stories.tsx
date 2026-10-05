import { type PropertyFilters, quickFilterLabel } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../../components/Button/Button.tsx";
import { MinCountFilter, PriceFilter, PropertyTypesFilter } from "../FilterPanel/FilterPanel.tsx";
import { FilterBar, type QuickFilter } from "./FilterBar.tsx";

function Demo({
  initial,
  location = "Pinheiros, São Paulo – SP",
}: {
  initial: PropertyFilters;
  location?: string;
}) {
  const [filters, setFilters] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [text, setText] = useState(location);
  const footer = (
    <>
      <Button variant="link" onClick={() => setFilters({})}>
        Limpar
      </Button>
      <Button size="sm" onClick={() => setOpen(null)}>
        Ver imóveis
      </Button>
    </>
  );
  const quickFilters: QuickFilter[] = [
    {
      id: "price",
      ...quickFilterLabel("price", filters),
      panel: <PriceFilter value={filters} onChange={setFilters} />,
    },
    {
      id: "types",
      ...quickFilterLabel("types", filters),
      panel: <PropertyTypesFilter value={filters} onChange={setFilters} />,
    },
    {
      id: "bedrooms",
      ...quickFilterLabel("bedrooms", filters),
      panel: <MinCountFilter field="bedrooms" value={filters} onChange={setFilters} />,
    },
    {
      id: "parking",
      ...quickFilterLabel("parking", filters),
      panel: <MinCountFilter field="parkingSpaces" value={filters} onChange={setFilters} />,
    },
  ].map((f) => ({ ...f, panelFooter: footer }));
  return (
    <div style={{ minHeight: 420 }}>
      <FilterBar
        location={{ value: text, onChange: setText }}
        quickFilters={quickFilters}
        openFilterId={open}
        onOpenFilterChange={setOpen}
        onMoreFilters={() => {}}
        activeCount={Object.keys(filters).length}
      />
    </div>
  );
}

const meta = {
  title: "Domain/FilterBar",
  component: FilterBar,
  parameters: { layout: "fullscreen" },
  args: {
    quickFilters: [],
    openFilterId: null,
    onOpenFilterChange: () => {},
    onMoreFilters: () => {},
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clique num chip para abrir o filtro dele. */
export const NoFilters: Story = { render: () => <Demo initial={{}} /> };
export const WithActiveFilters: Story = {
  render: () => (
    <Demo initial={{ price: { max: 900_000 }, types: ["APARTMENT"], minBedrooms: 3 }} />
  ),
};
export const EmptyLocation: Story = { render: () => <Demo initial={{}} location="" /> };
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  render: () => <Demo initial={{ minBedrooms: 2 }} />,
};
