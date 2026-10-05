import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button/Button.tsx";
import { Chip } from "../Chip/Chip.tsx";
import { CounterSelector } from "../CounterSelector/CounterSelector.tsx";
import { Popover } from "./Popover.tsx";

function Demo({ initiallyOpen }: { initiallyOpen: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      label="Quartos"
      anchor={
        <Chip hasMenu menuOpen={open} selected={bedrooms !== null} onClick={() => setOpen(!open)}>
          {bedrooms ? `${bedrooms}+ quartos` : "Quartos"}
        </Chip>
      }
      footer={
        <>
          <Button variant="link" onClick={() => setBedrooms(null)}>
            Limpar
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Ver 1.234 imóveis
          </Button>
        </>
      }
    >
      <CounterSelector label="Quartos" max={4} value={bedrooms} onChange={setBedrooms} />
    </Popover>
  );
}

const meta = {
  title: "Base/Popover",
  component: Popover,
  parameters: { layout: "padded" },
  args: { open: false, onClose: () => {}, anchor: null, label: "Quartos", children: null },
  decorators: [(Story) => <div style={{ minHeight: 320 }}>{Story()}</div>],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clique no chip; feche com Esc ou clicando fora. */
export const QuickFilter: Story = { render: () => <Demo initiallyOpen={false} /> };
export const Open: Story = { render: () => <Demo initiallyOpen /> };
