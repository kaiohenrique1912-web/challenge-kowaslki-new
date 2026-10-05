import { describe, expect, test } from "bun:test";
import {
  activeFilterChips,
  formatCompactBRL,
  QUICK_FILTER_IDS,
  QUICK_FILTERS,
  quickFilterLabel,
  removeActiveFilter,
  searchResultsHeading,
} from "./describe.ts";
import { countActiveFilters } from "./state.ts";

describe("describe search", () => {
  test("compact money", () => {
    expect(formatCompactBRL(900)).toBe("R$ 900");
    expect(formatCompactBRL(900_000)).toBe("R$ 900 mil");
    expect(formatCompactBRL(1_500_000)).toBe("R$ 1,5 mi");
  });

  test("results heading (business-rules §6.3)", () => {
    expect(
      searchResultsHeading({
        count: 7887,
        types: ["APARTMENT"],
        minBedrooms: 3,
        neighborhoodName: "Pinheiros",
      }),
    ).toEqual({
      title: "7.887 apartamentos",
      subtitle: "com 3 quartos à venda em Pinheiros, São Paulo, SP",
    });
    expect(searchResultsHeading({ count: 1, types: ["HOUSE", "STUDIO"] })).toEqual({
      title: "1 imóvel",
      subtitle: "à venda em São Paulo, SP",
    });
  });

  test("active filter chips and removal", () => {
    const filters = {
      price: { max: 900_000 },
      minBedrooms: 3,
      amenities: ["POOL" as const, "GYM" as const],
      furnished: false,
    };
    const chips = activeFilterChips(filters);
    expect(chips.map((c) => c.label)).toEqual([
      "Até R$ 900 mil",
      "3+ quartos",
      "Sem mobília",
      "Piscina",
      "Academia",
    ]);
    expect(removeActiveFilter(filters, "amenity:POOL").amenities).toEqual(["GYM"]);
    expect(removeActiveFilter(filters, "price").price).toBeUndefined();
    expect(countActiveFilters(filters)).toBe(4);
  });

  test("quick filter labels", () => {
    // Quartos e banheiros já vêm com "1+" marcado, como no original.
    expect(quickFilterLabel("bedrooms", {})).toEqual({ label: "1+ quartos", active: true });
    expect(quickFilterLabel("bathrooms", {})).toEqual({ label: "1+ banheiros", active: true });
    expect(quickFilterLabel("price", {})).toEqual({ label: "Valor do imóvel", active: false });
    expect(quickFilterLabel("monthlyCost", { monthlyCost: { max: 2_000 } }).label).toBe(
      "Até R$ 2 mil",
    );
    expect(QUICK_FILTER_IDS.map((id) => QUICK_FILTERS[id].name)).toEqual([
      "Valor do imóvel",
      "Condomínio + IPTU",
      "Tipos de imóvel",
      "Quartos",
      "Vagas de garagem",
      "Banheiros",
      "Área",
      "Mobiliado",
      "Próximo ao metrô",
      "Suítes",
    ]);
    expect(quickFilterLabel("bedrooms", { minBedrooms: 1 })).toEqual({
      label: "1+ quartos",
      active: true,
    });
    expect(quickFilterLabel("types", { types: ["APARTMENT", "HOUSE", "STUDIO"] }).label).toBe(
      "3 tipos",
    );
    expect(quickFilterLabel("price", { price: { min: 500_000, max: 1_500_000 } }).label).toBe(
      "R$ 500 mil – R$ 1,5 mi",
    );
    // Chips novos da barra (como no original).
    expect(quickFilterLabel("bathrooms", { minBathrooms: 1 }).label).toBe("1+ banheiros");
    expect(quickFilterLabel("furnished", {})).toEqual({ label: "Mobiliado", active: false });
    expect(quickFilterLabel("nearSubway", { nearSubway: true }).label).toBe("Próximo ao metrô");
    expect(quickFilterLabel("area", { area: { min: 50 } }).label).toBe("A partir de 50 m²");
    expect(quickFilterLabel("suites", {}).label).toBe("Suítes");
  });

  test("heading da área desenhada", () => {
    expect(searchResultsHeading({ count: 23_737, types: ["APARTMENT"], drawnArea: true })).toEqual({
      title: "23.737 apartamentos",
      subtitle: "à venda na área desenhada no mapa",
    });
  });
});

describe("validatePropertyFilters", () => {
  test("reports range errors per field with the API message", async () => {
    const { validatePropertyFilters } = await import("./validate.ts");
    expect(validatePropertyFilters({ price: { min: 900_000, max: 100 } })).toEqual({
      price: "Valor do imóvel: o valor mínimo não pode ser maior que o máximo.",
    });
    expect(validatePropertyFilters({ area: { min: 50 } })).toEqual({});
  });
});
