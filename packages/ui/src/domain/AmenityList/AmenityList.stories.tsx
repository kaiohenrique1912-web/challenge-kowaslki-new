import { getAmenity } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AmenityList } from "./AmenityList.tsx";

const pick = (...codes: Parameters<typeof getAmenity>[0][]) => codes.map(getAmenity);

const meta = {
  title: "Domain/AmenityList",
  component: AmenityList,
  args: {
    available: pick("BEDROOM_WARDROBES", "BATHROOM_CABINETS", "KITCHEN_CABINETS", "SERVICE_AREA"),
    unavailable: pick(
      "BATHTUB",
      "SHOWER_BOX",
      "BALCONY",
      "PRIVATE_POOL",
      "AIR_CONDITIONING",
      "GAS_SHOWER",
    ),
  },
  decorators: [(Story) => <div style={{ width: 760 }}>{Story()}</div>],
} satisfies Meta<typeof AmenityList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NothingAvailable: Story = { args: { available: [] } };
