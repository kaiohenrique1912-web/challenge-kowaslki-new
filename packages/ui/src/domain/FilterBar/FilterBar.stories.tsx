import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../../components/Button/Button.tsx";
import { FilterBar, type QuickFilter } from "./FilterBar.tsx";

const baseFilters: QuickFilter[] = [
  { id: "price", label: "Valor", active: false },
  { id: "types", label: "Tipos de imóvel", active: false },
  { id: "bedrooms", label: "Quartos", active: false },
  { id: "parking", label: "Vagas de garagem", active: false },
];

const meta = {
  title: "Domain/FilterBar",
  component: FilterBar,
  parameters: { layout: "fullscreen" },
  args: {
    quickFilters: baseFilters,
    onQuickFilterClick: () => {},
    onMoreFilters: () => {},
    location: { value: "Pinheiros, São Paulo – SP", onChange: () => {} },
  },
  render: function Render(args) {
    const [location, setLocation] = useState(args.location?.value ?? "");
    const [open, setOpen] = useState<string | null>(null);
    return (
      <FilterBar
        {...args}
        location={args.location ? { value: location, onChange: setLocation } : undefined}
        quickFilters={args.quickFilters.map((f) => ({ ...f, open: f.id === open }))}
        onQuickFilterClick={(id) => setOpen((current) => (current === id ? null : id))}
      />
    );
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoFilters: Story = {};
export const WithActiveFilters: Story = {
  args: {
    activeCount: 3,
    quickFilters: [
      { id: "price", label: "Até R$ 900 mil", active: true },
      { id: "types", label: "Apartamento", active: true },
      { id: "bedrooms", label: "3+ quartos", active: true },
      { id: "parking", label: "Vagas de garagem", active: false },
    ],
    trailing: (
      <Button variant="secondary" size="sm" iconLeft="sort">
        Mais relevantes
      </Button>
    ),
  },
};
export const EmptyLocation: Story = { args: { location: { value: "", onChange: () => {} } } };
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
