import { describe, expect, test } from "bun:test";
import {
  AMENITIES,
  AMENITY_CODES,
  getApplicableAmenities,
  isAmenityApplicable,
} from "./amenities.ts";

describe("amenities catalog", () => {
  test("has the 57 amenities from business-rules §3 with unique codes", () => {
    expect(AMENITIES).toHaveLength(57);
    expect(new Set(AMENITY_CODES).size).toBe(57);
  });

  test("applicability rules", () => {
    expect(isAmenityApplicable("POOL", "HOUSE")).toBe(false);
    expect(isAmenityApplicable("ELEVATOR", "HOUSE")).toBe(false);
    expect(isAmenityApplicable("POOL", "CONDO_HOUSE")).toBe(true);
    expect(isAmenityApplicable("PENTHOUSE", "APARTMENT")).toBe(true);
    expect(isAmenityApplicable("PENTHOUSE", "STUDIO")).toBe(false);
    expect(isAmenityApplicable("SINGLE_HOUSE_ON_LOT", "HOUSE")).toBe(true);
    expect(isAmenityApplicable("SINGLE_HOUSE_ON_LOT", "APARTMENT")).toBe(false);
  });

  test("house gets no condominium amenities", () => {
    const house = getApplicableAmenities("HOUSE");
    expect(house).not.toContain("GYM");
    expect(house).toContain("BACKYARD");
  });
});
