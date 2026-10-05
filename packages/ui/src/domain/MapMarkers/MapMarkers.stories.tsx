import type { Meta, StoryObj } from "@storybook/react-vite";
import { MapCluster, MapPin } from "./MapMarkers.tsx";

const meta = {
  title: "Domain/MapMarkers",
  component: MapCluster,
  args: { count: 53 },
  decorators: [
    (Story) => (
      <div style={{ background: "#e9e5dc", padding: 32, borderRadius: 12 }}>{Story()}</div>
    ),
  ],
} satisfies Meta<typeof MapCluster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cluster: Story = {};
export const SingleProperty: Story = { args: { count: 1 } };
export const Hundreds: Story = { args: { count: 104 } };
export const Thousands: Story = { args: { count: 1_250 } };
/** Card correspondente sob o mouse na lista. */
export const Highlighted: Story = { args: { highlighted: true } };
export const SearchPin: Story = { render: () => <MapPin /> };

/** Como aparecem sobre o mapa (afastado e de perto). */
export const OnMap: Story = {
  render: () => (
    <div style={{ position: "relative", width: 480, height: 280 }}>
      {[
        [40, 30, 65],
        [180, 60, 104],
        [300, 40, 7],
        [120, 170, 1],
        [360, 190, 1_250],
      ].map(([x, y, n]) => (
        <div key={`${x}-${y}`} style={{ position: "absolute", left: x, top: y }}>
          <MapCluster count={n as number} highlighted={n === 104} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 240, top: 120 }}>
        <MapPin />
      </div>
    </div>
  ),
};
