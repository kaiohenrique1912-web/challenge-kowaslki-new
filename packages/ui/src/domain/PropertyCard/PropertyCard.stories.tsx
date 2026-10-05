import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { sampleProperties, sampleProperty } from "../../fixtures/properties.ts";
import { PropertyCard, PropertyCardSkeleton } from "./PropertyCard.tsx";

const meta = {
  title: "Domain/PropertyCard",
  component: PropertyCard,
  args: { property: sampleProperty, href: "#imovel-1002391", onFavoriteToggle: () => {} },
  decorators: [(Story) => <div style={{ width: 300 }}>{Story()}</div>],
  render: function Render(args) {
    const [favorite, setFavorite] = useState(args.property.isFavorite);
    return (
      <PropertyCard
        {...args}
        property={{ ...args.property, isFavorite: favorite }}
        onFavoriteToggle={args.onFavoriteToggle ? setFavorite : undefined}
      />
    );
  },
} satisfies Meta<typeof PropertyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Favorite: Story = { args: { property: { ...sampleProperty, isFavorite: true } } };
/** Estado quando o pin do imóvel está sob o mouse no mapa. */
export const HighlightedFromMap: Story = { args: { highlighted: true } };
export const NoBadgesNoParking: Story = {
  args: { property: { ...sampleProperty, badges: [], parkingSpaces: 0 } },
};
export const StudioWithoutCondo: Story = { args: { property: sampleProperties[2] } };
export const WithoutPhotos: Story = { args: { property: { ...sampleProperty, photos: [] } } };
export const WithoutFavorite: Story = { args: { onFavoriteToggle: undefined } };
export const Loading: Story = { render: () => <PropertyCardSkeleton /> };

/** Grade de 3 colunas como na página de resultados. */
export const ResultsGrid: Story = {
  decorators: [(Story) => <div style={{ width: 900 }}>{Story()}</div>],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
      {sampleProperties.map((p) => (
        <PropertyCard key={p.id} property={p} href={`#${p.id}`} onFavoriteToggle={() => {}} />
      ))}
      <PropertyCardSkeleton />
      <PropertyCardSkeleton />
      <PropertyCardSkeleton />
    </div>
  ),
};
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  decorators: [(Story) => <div style={{ width: "100%" }}>{Story()}</div>],
};
