import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { sampleProperties } from "../../fixtures/properties.ts";
import { AppHeader } from "../AppHeader/AppHeader.tsx";
import { FilterBar } from "../FilterBar/FilterBar.tsx";
import { MapCluster, MapPin } from "../MapMarkers/MapMarkers.tsx";
import { PropertyCard } from "../PropertyCard/PropertyCard.tsx";
import { ResultsHeader } from "../ResultsHeader/ResultsHeader.tsx";
import { SortMenu } from "../SortMenu/SortMenu.tsx";
import { SearchLayout, type SearchView } from "./SearchLayout.tsx";

function FakeMap() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#e9e5dc" }}>
      <div style={{ position: "absolute", left: "30%", top: "30%" }}>
        <MapCluster count={53} />
      </div>
      <div style={{ position: "absolute", left: "60%", top: "45%" }}>
        <MapCluster count={1} />
      </div>
      <div style={{ position: "absolute", left: "45%", top: "60%" }}>
        <MapPin />
      </div>
    </div>
  );
}

function Demo() {
  const [view, setView] = useState<SearchView>("list");
  return (
    <SearchLayout
      mobileView={view}
      onMobileViewChange={setView}
      header={<AppHeader links={[{ label: "Comprar", href: "#", active: true }]} />}
      filters={
        <FilterBar
          location={{ value: "Pinheiros, São Paulo – SP", onChange: () => {} }}
          quickFilters={[
            { id: "price", label: "Valor", active: false },
            { id: "bedrooms", label: "3+ quartos", active: true },
          ]}
          openFilterId={null}
          onOpenFilterChange={() => {}}
          onMoreFilters={() => {}}
          activeCount={1}
        />
      }
      list={
        <>
          <ResultsHeader
            title="566 Imóveis"
            subtitle="com 3 quartos à venda em Pinheiros, São Paulo, SP"
            actions={<SortMenu value="RELEVANCE" onChange={() => {}} />}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {[...sampleProperties, ...sampleProperties.map((p) => ({ ...p, id: `${p.id}-b` }))].map(
              (p) => (
                <PropertyCard key={p.id} property={p} href="#" />
              ),
            )}
          </div>
        </>
      }
      map={<FakeMap />}
    />
  );
}

const meta = {
  title: "Domain/SearchLayout",
  component: SearchLayout,
  parameters: { layout: "fullscreen" },
  args: {
    filters: null,
    list: null,
    map: null,
    mobileView: "list",
    onMobileViewChange: () => {},
  },
  render: () => <Demo />,
} satisfies Meta<typeof SearchLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};
/** No mobile, o botão flutuante alterna Lista/Mapa. */
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
