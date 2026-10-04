import { describe, expect, test } from "bun:test";
import {
  type BadgeInput,
  computeBadges,
  computeEstimatedRent,
  computePricePerM2,
  computeRelevanceScore,
  computeRentalYield,
  median,
} from "./derived.ts";

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 9, 1);

const base: BadgeInput = {
  isExclusive: false,
  isRented: false,
  salePrice: 1_000_000,
  previousPrice: null,
  pricePerM2: 10_000,
  publishedAt: NOW - 30 * DAY,
};

describe("derived fields", () => {
  test("price per m2 and rental yield", () => {
    expect(computePricePerM2(1_555_000, 120)).toBe(12_958);
    expect(computeRentalYield(4_500, 1_000_000)).toBeCloseTo(0.0045);
  });

  test("estimated rent uses current rent when rented", () => {
    expect(computeEstimatedRent({ isRented: true, monthlyRent: 3_200, area: 80 }, 50)).toBe(3_200);
    expect(computeEstimatedRent({ isRented: false, monthlyRent: null, area: 80 }, 50)).toBe(4_000);
  });

  test("median", () => {
    expect(median([])).toBe(0);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(3);
  });
});

describe("computeBadges", () => {
  test("no badges for a plain listing", () => {
    expect(computeBadges(base, 10_000, NOW)).toEqual([]);
  });

  test("all badges in priority order", () => {
    const badges = computeBadges(
      {
        isExclusive: true,
        isRented: true,
        salePrice: 900_000,
        previousPrice: 1_000_000,
        pricePerM2: 8_000,
        publishedAt: NOW - 2 * DAY,
      },
      10_000,
      NOW,
    );
    expect(badges).toEqual(["EXCLUSIVE", "PRICE_DROP", "GREAT_PRICE", "NEW_LISTING", "RENTED"]);
  });

  test("great price threshold is 85% of the neighborhood median", () => {
    expect(computeBadges({ ...base, pricePerM2: 8_500 }, 10_000, NOW)).toContain("GREAT_PRICE");
    expect(computeBadges({ ...base, pricePerM2: 8_501 }, 10_000, NOW)).not.toContain("GREAT_PRICE");
  });

  test("price drop needs a higher previous price", () => {
    expect(computeBadges({ ...base, previousPrice: 1_000_000 }, 0, NOW)).toEqual([]);
  });
});

describe("computeRelevanceScore", () => {
  test("max score", () => {
    const score = computeRelevanceScore(
      {
        photoCount: 20,
        descriptionLength: 400,
        isExclusive: true,
        publishedAt: NOW,
        badges: ["GREAT_PRICE"],
      },
      NOW,
    );
    expect(score).toBe(100);
  });

  test("recency decays to zero after 90 days", () => {
    const input = {
      photoCount: 0,
      descriptionLength: 0,
      isExclusive: false,
      badges: [],
    };
    expect(computeRelevanceScore({ ...input, publishedAt: NOW - 45 * DAY }, NOW)).toBe(10);
    expect(computeRelevanceScore({ ...input, publishedAt: NOW - 120 * DAY }, NOW)).toBe(0);
    expect(computeRelevanceScore({ ...input, publishedAt: null }, NOW)).toBe(0);
  });
});
