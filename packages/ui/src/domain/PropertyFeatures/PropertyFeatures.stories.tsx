import { propertyFeatures } from "@qa/shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PropertyFeatures } from "./PropertyFeatures.tsx";

const apartment = {
  type: "APARTMENT" as const,
  area: 90,
  bedrooms: 3,
  suites: 1,
  bathrooms: 2,
  parkingSpaces: 0,
  floor: 3,
  acceptsPets: true,
  isFurnished: false,
  nearSubway: true,
};

const meta = {
  title: "Domain/PropertyFeatures",
  component: PropertyFeatures,
  args: { features: propertyFeatures(apartment) },
  decorators: [(Story) => <div style={{ width: 760 }}>{Story()}</div>],
} satisfies Meta<typeof PropertyFeatures>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Apartment: Story = {};
export const House: Story = {
  args: {
    features: propertyFeatures({
      ...apartment,
      type: "HOUSE",
      floor: null,
      parkingSpaces: 2,
      nearSubway: false,
    }),
  },
};
