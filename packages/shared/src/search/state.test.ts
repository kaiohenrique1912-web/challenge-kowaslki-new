import { describe, expect, test } from "bun:test";
import { normalizeFilters } from "./state.ts";

describe("normalizeFilters", () => {
  test("lados da faixa iguais aos limites do painel não filtram", () => {
    expect(normalizeFilters({ price: { min: 150_000, max: 20_000_000 } })).toEqual({});
    expect(normalizeFilters({ price: { min: 150_000, max: 900_000 } })).toEqual({
      price: { max: 900_000 },
    });
    expect(normalizeFilters({ monthlyCost: { min: 0, max: 15_000 } })).toEqual({});
    expect(normalizeFilters({ area: { min: 50, max: 1_000 } })).toEqual({ area: { min: 50 } });
  });

  test("'1+ quartos' e '1+ banheiros' são o padrão (= sem filtro)", () => {
    expect(normalizeFilters({ minBedrooms: 1, minBathrooms: 1 })).toEqual({});
    expect(normalizeFilters({ minBedrooms: 2, minBathrooms: 1 })).toEqual({ minBedrooms: 2 });
    expect(normalizeFilters({ minSuites: 1 })).toEqual({ minSuites: 1 });
  });
});
