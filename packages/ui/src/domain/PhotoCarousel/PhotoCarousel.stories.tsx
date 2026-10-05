import type { Meta, StoryObj } from "@storybook/react-vite";
import { samplePhotos } from "../../fixtures/properties.ts";
import { PropertyBadges } from "../PropertyBadges/PropertyBadges.tsx";
import { PhotoCarousel } from "./PhotoCarousel.tsx";

const meta = {
  title: "Domain/PhotoCarousel",
  component: PhotoCarousel,
  args: { photos: samplePhotos, alt: "Apartamento à venda em Pinheiros" },
  decorators: [(Story) => <div style={{ width: 300 }}>{Story()}</div>],
} satisfies Meta<typeof PhotoCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Passe o mouse para ver as setas; com foco, use ← →. */
export const Default: Story = {};
export const WithBadges: Story = {
  args: { overlay: <PropertyBadges badges={["EXCLUSIVE", "PRICE_DROP", "NEW_LISTING"]} /> },
};
export const ManyPhotos: Story = {
  args: { photos: [...samplePhotos, ...samplePhotos, ...samplePhotos] },
};
export const SinglePhoto: Story = { args: { photos: samplePhotos.slice(0, 1) } };
export const Empty: Story = { args: { photos: [] } };
