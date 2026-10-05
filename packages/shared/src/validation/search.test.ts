import { describe, expect, test } from "bun:test";
import { mapClustersArgsSchema, searchArgsSchema, searchFiltersSchema } from "./search.ts";

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.success ? [] : (result.error?.issues.map((i) => i.message) ?? []);

describe("searchFiltersSchema", () => {
  test("accepts empty and null filters", () => {
    expect(searchFiltersSchema.safeParse({}).success).toBe(true);
    expect(searchFiltersSchema.safeParse({ price: null, types: null }).success).toBe(true);
  });

  test("min greater than max gives a clear Portuguese error", () => {
    const result = searchFiltersSchema.safeParse({ price: { min: 900_000, max: 500_000 } });
    expect(messages(result)).toEqual([
      "Valor do imóvel: o valor mínimo não pode ser maior que o máximo.",
    ]);
  });

  test("open ranges are fine", () => {
    expect(searchFiltersSchema.safeParse({ area: { min: 50 } }).success).toBe(true);
    expect(searchFiltersSchema.safeParse({ area: { max: 50 } }).success).toBe(true);
  });

  test("negative values and out-of-range pills are rejected", () => {
    expect(searchFiltersSchema.safeParse({ monthlyCost: { min: -1 } }).success).toBe(false);
    expect(searchFiltersSchema.safeParse({ minBedrooms: 5 }).success).toBe(false);
    expect(searchFiltersSchema.safeParse({ minParkingSpaces: 4 }).success).toBe(false);
  });

  test("bounding box must be well formed", () => {
    const bad = searchFiltersSchema.safeParse({
      bbox: { north: -23.6, south: -23.5, east: -46.6, west: -46.7 },
    });
    expect(messages(bad)).toEqual(["Área do mapa inválida: norte deve ser maior que sul."]);
  });

  test("rejects duplicated amenities and unknown keys", () => {
    expect(searchFiltersSchema.safeParse({ amenities: ["POOL", "POOL"] }).success).toBe(false);
    expect(searchFiltersSchema.safeParse({ color: "blue" }).success).toBe(false);
  });
});

describe("searchArgsSchema / mapClustersArgsSchema", () => {
  test("page size is limited to 48", () => {
    expect(searchArgsSchema.safeParse({ first: 48 }).success).toBe(true);
    expect(searchArgsSchema.safeParse({ first: 49 }).success).toBe(false);
    expect(searchArgsSchema.safeParse({ first: 0 }).success).toBe(true);
  });

  test("zoom must be an integer between 0 and 22", () => {
    const bbox = { north: -23.5, south: -23.6, east: -46.6, west: -46.7 };
    expect(mapClustersArgsSchema.safeParse({ bbox, zoom: 14 }).success).toBe(true);
    expect(mapClustersArgsSchema.safeParse({ bbox, zoom: 23 }).success).toBe(false);
    expect(mapClustersArgsSchema.safeParse({ bbox, zoom: 1.5 }).success).toBe(false);
  });
});
