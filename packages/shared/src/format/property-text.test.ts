import { describe, expect, test } from "bun:test";
import {
  formatArea,
  formatBRL,
  monthlyCostLabel,
  pluralize,
  propertyAttributesLine,
  propertyHeadline,
  propertyTitle,
  publicAddress,
} from "./property-text.ts";

describe("property texts", () => {
  test("formatting", () => {
    expect(formatBRL(1_555_000)).toBe("R$ 1.555.000");
    expect(formatArea(120)).toBe("120 m²");
    expect(pluralize(1, "quarto", "quartos")).toBe("1 quarto");
    expect(pluralize(3, "quarto", "quartos")).toBe("3 quartos");
  });

  test("card title", () => {
    expect(propertyTitle({ type: "APARTMENT", bedrooms: 3, neighborhoodName: "Pinheiros" })).toBe(
      "Apartamento à venda em Pinheiros com 3 quartos",
    );
    expect(propertyTitle({ type: "STUDIO", bedrooms: 0, neighborhoodName: "Sé" })).toBe(
      "Studio à venda em Sé",
    );
  });

  test("card attributes line, monthly cost and address", () => {
    const apt = { type: "APARTMENT" as const, area: 120, bedrooms: 3, parkingSpaces: 2 };
    expect(propertyAttributesLine(apt)).toBe("120 m² · 3 quartos · 2 vagas");
    expect(propertyAttributesLine({ ...apt, parkingSpaces: 0 })).toBe("120 m² · 3 quartos");
    expect(propertyAttributesLine({ ...apt, type: "STUDIO", bedrooms: 0, parkingSpaces: 1 })).toBe(
      "120 m² · Studio · 1 vaga",
    );
    expect(monthlyCostLabel(2_350)).toBe("R$ 2.350 Condo. + IPTU");
    expect(monthlyCostLabel(0)).toBe("R$ 0 Condo. + IPTU");
    expect(publicAddress("Rua João Moura", "Pinheiros")).toBe(
      "Rua João Moura, Pinheiros · São Paulo",
    );
  });

  test("detail headline", () => {
    expect(propertyHeadline({ type: "HOUSE", area: 90, bedrooms: 3, parkingSpaces: 0 })).toBe(
      "Casa à venda com 90m², 3 quartos e sem vaga",
    );
    expect(propertyHeadline({ type: "APARTMENT", area: 120, bedrooms: 3, parkingSpaces: 1 })).toBe(
      "Apartamento à venda com 120m², 3 quartos e 1 vaga",
    );
    expect(propertyHeadline({ type: "STUDIO", area: 25, bedrooms: 0, parkingSpaces: 0 })).toBe(
      "Studio à venda com 25m² e sem vaga",
    );
  });
});
