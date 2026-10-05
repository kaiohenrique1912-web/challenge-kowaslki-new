import { formatMonthlyYield, priceSummary } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../components/Button/Button.tsx";
import { FavoriteButton } from "../FavoriteButton/FavoriteButton.tsx";
import { PriceSummary } from "./PriceSummary.tsx";

const summary = priceSummary({
  salePrice: 1_555_000,
  condoFee: 1_800,
  iptu: 550,
  monthlyCost: 2_350,
});

const meta = {
  title: "Domain/PriceSummary",
  component: PriceSummary,
  args: {
    ...summary,
    note: `Retorno estimado com aluguel: ${formatMonthlyYield(0.0045)}`,
    actions: (
      <>
        <Button fullWidth>Agendar visita</Button>
        <Button fullWidth variant="secondary">
          Fazer proposta
        </Button>
      </>
    ),
    footer: (
      <>
        <FavoriteButton favorite={false} onToggle={() => {}} showLabel />
        <Button variant="link" iconLeft="share">
          Compartilhar
        </Button>
      </>
    ),
  },
  decorators: [(Story) => <div style={{ width: 340, padding: 24 }}>{Story()}</div>],
} satisfies Meta<typeof PriceSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const HouseWithoutCondo: Story = {
  args: priceSummary({ salePrice: 650_000, condoFee: 0, iptu: 0, monthlyCost: 0 }),
};
export const WithoutActions: Story = {
  args: { actions: undefined, footer: undefined, note: undefined },
};
