import { describe, expect, test } from "bun:test";
import { DRAWN_AREA, isInsidePolygon, polygonBounds, simplifyPolygon } from "./drawn-area.ts";

const square = [
  { lat: -23.5, lng: -46.7 },
  { lat: -23.5, lng: -46.6 },
  { lat: -23.6, lng: -46.6 },
  { lat: -23.6, lng: -46.7 },
];

describe("área desenhada", () => {
  test("ponto dentro e fora de um quadrado", () => {
    expect(isInsidePolygon({ lat: -23.55, lng: -46.65 }, square)).toBe(true);
    expect(isInsidePolygon({ lat: -23.45, lng: -46.65 }, square)).toBe(false);
    expect(isInsidePolygon({ lat: -23.55, lng: -46.75 }, square)).toBe(false);
  });

  test("polígono côncavo (formato de L)", () => {
    const l = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 2 },
      { lat: 1, lng: 2 },
      { lat: 1, lng: 1 },
      { lat: 2, lng: 1 },
      { lat: 2, lng: 0 },
    ];
    expect(isInsidePolygon({ lat: 0.5, lng: 1.5 }, l)).toBe(true);
    expect(isInsidePolygon({ lat: 1.5, lng: 0.5 }, l)).toBe(true);
    expect(isInsidePolygon({ lat: 1.5, lng: 1.5 }, l)).toBe(false);
  });

  test("limites do polígono", () => {
    expect(polygonBounds(square)).toEqual({ north: -23.5, south: -23.6, east: -46.6, west: -46.7 });
  });

  test("simplifica um traço longo para no máximo 40 vértices sem perder a forma", () => {
    const circle = Array.from({ length: 500 }, (_, i) => {
      const angle = (i / 500) * 2 * Math.PI;
      return { lat: -23.55 + 0.05 * Math.sin(angle), lng: -46.65 + 0.05 * Math.cos(angle) };
    });
    const simple = simplifyPolygon(circle);
    expect(simple.length).toBeLessThanOrEqual(DRAWN_AREA.maxPoints);
    expect(simple.length).toBeGreaterThanOrEqual(DRAWN_AREA.minPoints);
    expect(isInsidePolygon({ lat: -23.55, lng: -46.65 }, simple)).toBe(true);
    expect(isInsidePolygon({ lat: -23.49, lng: -46.65 }, simple)).toBe(false);
  });

  test("traço curto fica como está (sem pontos repetidos)", () => {
    expect(simplifyPolygon([...square, { lat: -23.6, lng: -46.7 }])).toHaveLength(4);
  });
});
