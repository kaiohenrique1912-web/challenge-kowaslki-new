import { describe, expect, test } from "bun:test";
import {
  floorLabel,
  formatMonthlyYield,
  formatPublishedAgo,
  priceSummary,
  propertyFeatures,
} from "./property-detail.ts";

const NOW = Date.UTC(2026, 9, 5, 12);
const DAY = 86_400_000;

describe("property detail texts", () => {
  test("published ago", () => {
    expect(formatPublishedAgo(NOW - 2 * 3_600_000, NOW)).toBe("Publicado hoje");
    expect(formatPublishedAgo(NOW - DAY, NOW)).toBe("Publicado há 1 dia");
    expect(formatPublishedAgo(new Date(NOW - 12 * DAY).toISOString(), NOW)).toBe(
      "Publicado há 12 dias",
    );
    expect(formatPublishedAgo(NOW - 65 * DAY, NOW)).toBe("Publicado há 2 meses");
    expect(formatPublishedAgo(NOW - 400 * DAY, NOW)).toBe("Publicado há 1 ano");
  });

  test("floor and yield", () => {
    expect(floorLabel(0)).toBe("Térreo");
    expect(floorLabel(5)).toBe("5º andar");
    expect(formatMonthlyYield(0.0045)).toBe("0,45% a.m.");
  });

  test("features of an apartment and of a house", () => {
    const apt = {
      type: "APARTMENT" as const,
      area: 90,
      bedrooms: 3,
      suites: 1,
      bathrooms: 2,
      parkingSpaces: 0,
      floor: 3,
      acceptsPets: true,
      isFurnished: false,
      nearSubway: true,
    };
    expect(propertyFeatures(apt).map((f) => f.label)).toEqual([
      "90 m²",
      "3 quartos",
      "1 suíte",
      "2 banheiros",
      "Sem vaga",
      "3º andar",
      "Aceita pet",
      "Sem mobília",
      "Metrô próx.",
    ]);
    const house = { ...apt, type: "HOUSE" as const, floor: null, suites: 0, nearSubway: false };
    expect(propertyFeatures(house).map((f) => f.kind)).toEqual([
      "area",
      "bedrooms",
      "bathrooms",
      "parking",
      "pets",
      "furnished",
    ]);
  });

  test("price summary", () => {
    expect(priceSummary({ salePrice: 1_555_000, condoFee: 0, iptu: 0, monthlyCost: 0 })).toEqual({
      rows: [
        { label: "Venda", value: "R$ 1.555.000" },
        { label: "Condomínio", value: "Não há", hint: "Valor mensal cobrado pelo condomínio." },
        { label: "IPTU", value: "Isento", hint: "Valor mensal (IPTU anual dividido por 12)." },
      ],
      total: { label: "Condo. + IPTU", value: "R$ 0/mês" },
    });
  });
});
