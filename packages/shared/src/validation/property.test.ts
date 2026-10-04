import { describe, expect, test } from "bun:test";
import { type PropertyInput, propertyInputSchema } from "./property.ts";

const valid: PropertyInput = {
  type: "APARTMENT",
  cep: "05422-030",
  street: "Rua João Moura",
  number: "123",
  complement: "Apto 52",
  neighborhoodId: 1,
  latitude: -23.567,
  longitude: -46.693,
  salePrice: 1_555_000,
  condoFee: 1_800,
  iptu: 550,
  area: 120,
  bedrooms: 3,
  suites: 1,
  bathrooms: 2,
  parkingSpaces: 2,
  floor: 5,
  isFurnished: false,
  acceptsPets: true,
  nearSubway: true,
  isExclusive: false,
  isRented: false,
  monthlyRent: null,
  description: "Apartamento amplo e arejado, perto do metrô e de comércio.",
  amenities: ["POOL", "BALCONY"],
  photos: ["/static/photos/living-1.svg"],
};

function errorsFor(overrides: Partial<PropertyInput>): Record<string, string[]> {
  const result = propertyInputSchema.safeParse({ ...valid, ...overrides });
  if (result.success) return {};
  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    errors[key] = [...(errors[key] ?? []), issue.message];
  }
  return errors;
}

describe("propertyInputSchema", () => {
  test("accepts a valid apartment", () => {
    expect(propertyInputSchema.safeParse(valid).success).toBe(true);
  });

  test("enforces price and area ranges", () => {
    expect(errorsFor({ salePrice: 49_999 }).salePrice).toBeDefined();
    expect(errorsFor({ salePrice: 50_000_001 }).salePrice).toBeDefined();
    expect(errorsFor({ area: 9 }).area).toBeDefined();
  });

  test("requires location inside São Paulo", () => {
    expect(errorsFor({ latitude: -22.9 }).latitude).toBeDefined();
    expect(errorsFor({ longitude: -46.2 }).longitude).toBeDefined();
    expect(errorsFor({ cep: "13000-000" }).cep).toBeDefined();
    expect(errorsFor({ cep: "05422030" }).cep).toBeDefined();
  });

  test("suites <= bedrooms and bathrooms >= suites", () => {
    expect(errorsFor({ suites: 4 }).suites).toBeDefined();
    expect(errorsFor({ suites: 3, bathrooms: 2 }).bathrooms).toBeDefined();
  });

  test("studio rules", () => {
    const studio = { type: "STUDIO" as const, bedrooms: 1, suites: 0, area: 30, amenities: [] };
    expect(errorsFor(studio)).toEqual({});
    expect(errorsFor({ ...studio, area: 61 }).area).toBeDefined();
    expect(errorsFor({ ...studio, bedrooms: 2 }).bedrooms).toBeDefined();
  });

  test("non-studio needs at least one bedroom", () => {
    expect(errorsFor({ bedrooms: 0, suites: 0 }).bedrooms).toBeDefined();
  });

  test("house has no condo fee, no floor and no condominium amenities", () => {
    const house = { type: "HOUSE" as const, condoFee: 0, floor: null, amenities: [] };
    expect(errorsFor(house)).toEqual({});
    expect(errorsFor({ ...house, condoFee: 100 }).condoFee).toBeDefined();
    expect(errorsFor({ ...house, floor: 1 }).floor).toBeDefined();
    expect(errorsFor({ ...house, amenities: ["POOL"] }).amenities).toBeDefined();
  });

  test("monthly rent only and always for rented properties", () => {
    expect(errorsFor({ isRented: true, monthlyRent: null }).monthlyRent).toBeDefined();
    expect(errorsFor({ isRented: false, monthlyRent: 3_000 }).monthlyRent).toBeDefined();
    expect(errorsFor({ isRented: true, monthlyRent: 3_000 })).toEqual({});
  });

  test("rejects duplicated amenities and requires a photo", () => {
    expect(errorsFor({ amenities: ["POOL", "POOL"] }).amenities).toBeDefined();
    expect(errorsFor({ photos: [] }).photos).toBeDefined();
  });

  test("messages are in Portuguese", () => {
    expect(errorsFor({ suites: 4 }).suites).toEqual([
      "Suítes não podem passar do número de quartos.",
    ]);
  });
});
