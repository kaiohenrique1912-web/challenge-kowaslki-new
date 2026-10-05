import { describe, expect, test } from "bun:test";
import { cellSizeForZoom, MAX_MAP_CELLS } from "@qa/shared";
import { createTestApp, gql } from "../../testing/test-app.ts";

const app = createTestApp();

type Cluster = {
  id: string;
  count: number;
  propertyId: string | null;
  center: { lat: number; lng: number };
  bounds: { north: number; south: number; east: number; west: number };
};
type MapResult = { propertyMapClusters: { totalCount: number; zoom: number; clusters: Cluster[] } };

const MAP = `query($filters: PropertySearchFilters, $bbox: BoundingBox!, $zoom: Int!) {
  propertyMapClusters(filters: $filters, bbox: $bbox, zoom: $zoom) {
    totalCount zoom clusters { id count propertyId center { lat lng } bounds { north south east west } }
  } }`;
const COUNT = `query($filters: PropertySearchFilters) { searchProperties(filters: $filters, first: 0) { totalCount } }`;

const CITY = { north: -23.35, south: -24.01, east: -46.36, west: -46.83 };
const WEST_ZONE = { north: -23.52, south: -23.6, east: -46.65, west: -46.75 };

async function clusters(variables: Record<string, unknown>) {
  const body = await gql<MapResult>(app, MAP, variables);
  if (body.errors) throw new Error(body.errors[0]?.message);
  return body.data?.propertyMapClusters as MapResult["propertyMapClusters"];
}

describe("propertyMapClusters", () => {
  test("cluster counts add up to the list total for the same area and filters", async () => {
    const filters = { minBedrooms: 2, types: ["APARTMENT"] };
    const map = await clusters({ filters, bbox: WEST_ZONE, zoom: 14 });
    const list = await gql<{ searchProperties: { totalCount: number } }>(app, COUNT, {
      filters: { ...filters, bbox: WEST_ZONE },
    });
    expect(map.totalCount).toBe(list.data?.searchProperties.totalCount as number);
    expect(map.clusters.reduce((s, c) => s + c.count, 0)).toBe(map.totalCount);
  });

  test("aggregates thousands of properties into few clusters when zoomed out", async () => {
    const map = await clusters({ bbox: CITY, zoom: 10 });
    expect(map.totalCount).toBeGreaterThan(4_000);
    expect(map.clusters.length).toBeLessThan(150);
  });

  test("every cluster stays inside its grid cell and single ones carry the property id", async () => {
    const zoom = 15;
    const map = await clusters({ bbox: WEST_ZONE, zoom });
    const size = cellSizeForZoom(zoom);
    for (const c of map.clusters) {
      const [, row, col] = c.id.split(":").map((part) => Number(part.replace("z", "")));
      expect(c.bounds.south).toBeGreaterThanOrEqual((row as number) * size - 90 - 1e-9);
      expect(c.bounds.north).toBeLessThan(((row as number) + 1) * size - 90 + 1e-9);
      expect(c.bounds.west).toBeGreaterThanOrEqual((col as number) * size - 180 - 1e-9);
      expect(c.bounds.east).toBeLessThan(((col as number) + 1) * size - 180 + 1e-9);
      expect(c.propertyId !== null).toBe(c.count === 1);
    }
    expect(map.clusters.some((c) => c.count === 1)).toBe(true);
  });

  test("lowers the zoom when the area would produce too many cells", async () => {
    const map = await clusters({ bbox: CITY, zoom: 22 });
    expect(map.zoom).toBeLessThan(22);
    expect(map.clusters.length).toBeLessThanOrEqual(MAX_MAP_CELLS);

    // Juntar células em memória dá o mesmo resultado que agregar direto no zoom final.
    const direct = await clusters({ bbox: CITY, zoom: map.zoom });
    const summary = (list: Cluster[]) =>
      list.map((c) => `${c.id}=${c.count}:${c.propertyId}`).sort();
    expect(summary(map.clusters)).toEqual(summary(direct.clusters));
  });

  test("neighborhood filter is optional: without it the map shows other neighborhoods too", async () => {
    const withNeighborhood = await clusters({
      filters: { neighborhoodSlugs: ["pinheiros"] },
      bbox: WEST_ZONE,
      zoom: 13,
    });
    const withoutNeighborhood = await clusters({ bbox: WEST_ZONE, zoom: 13 });
    expect(withoutNeighborhood.totalCount).toBeGreaterThan(withNeighborhood.totalCount);
  });

  test("validates zoom and bbox", async () => {
    const badZoom = await gql<MapResult>(app, MAP, { bbox: WEST_ZONE, zoom: 30 });
    expect(badZoom.errors?.[0]?.extensions?.field).toBe("zoom");
    const badBox = await gql<MapResult>(app, MAP, {
      bbox: { ...WEST_ZONE, east: -46.8 },
      zoom: 12,
    });
    expect(badBox.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
  });
});
