import { describe, expect, test } from "bun:test";
import { cellOf, cellSizeForZoom, clusterId } from "./map-grid.ts";
import { publishedWithinStart } from "./search.ts";

describe("publishedWithinStart", () => {
  test("TODAY starts at midnight in São Paulo (UTC−3)", () => {
    // 2026-10-05 02:00 UTC = 2026-10-04 23:00 em SP → hoje começou em 2026-10-04 03:00 UTC
    expect(publishedWithinStart("TODAY", Date.UTC(2026, 9, 5, 2))).toBe(Date.UTC(2026, 9, 4, 3));
    expect(publishedWithinStart("TODAY", Date.UTC(2026, 9, 5, 15))).toBe(Date.UTC(2026, 9, 5, 3));
  });

  test("relative periods", () => {
    const now = Date.UTC(2026, 9, 5);
    expect(publishedWithinStart("LAST_7_DAYS", now)).toBe(now - 7 * 86_400_000);
    expect(publishedWithinStart("LAST_2_MONTHS", now)).toBe(now - 60 * 86_400_000);
  });
});

describe("map grid", () => {
  test("cell size halves at each zoom level", () => {
    expect(cellSizeForZoom(0)).toBe(90);
    expect(cellSizeForZoom(12)).toBeCloseTo(cellSizeForZoom(11) / 2);
  });

  test("cells are stable and anchored at (-90, -180)", () => {
    const a = cellOf({ lat: -23.5505, lng: -46.6333 }, 12);
    const b = cellOf({ lat: -23.5506, lng: -46.6334 }, 12);
    expect(a).toEqual(b);
    expect(clusterId(12, a.row, a.col)).toBe(`z12:${a.row}:${a.col}`);
  });
});
