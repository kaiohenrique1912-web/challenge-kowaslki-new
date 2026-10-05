import { describe, expect, test } from "bun:test";
import { buildPropertyWhere } from "./property-where.ts";

const ctx = { userId: "u1", now: Date.UTC(2026, 9, 1, 12) };

describe("buildPropertyWhere", () => {
  test("always restricts to ACTIVE", () => {
    expect(buildPropertyWhere(null, ctx)).toEqual({ sql: "p.status = 'ACTIVE'", params: [] });
  });

  test("ranges are inclusive and each side is optional", () => {
    const where = buildPropertyWhere({ price: { min: 100 }, area: { max: 80 } }, ctx);
    expect(where.sql).toContain("p.sale_price >= ?");
    expect(where.sql).not.toContain("p.sale_price <= ?");
    expect(where.sql).toContain("p.area <= ?");
    expect(where.params).toEqual([100, 80]);
  });

  test("lists use IN and amenities require all codes", () => {
    const where = buildPropertyWhere(
      { types: ["APARTMENT", "STUDIO"], amenities: ["POOL", "GYM"] },
      ctx,
    );
    expect(where.sql).toContain("p.type IN (?, ?)");
    expect(where.sql).toContain("amenity_code = ? INTERSECT SELECT property_id");
    expect(where.params).toEqual(["APARTMENT", "STUDIO", "POOL", "GYM"]);
  });

  test("rented=false means 'tanto faz'", () => {
    expect(buildPropertyWhere({ rented: false }, ctx).sql).not.toContain("is_rented");
    expect(buildPropertyWhere({ rented: true }, ctx).sql).toContain("p.is_rented = 1");
  });

  test("booleans filter both ways", () => {
    const where = buildPropertyWhere({ furnished: false, nearSubway: true }, ctx);
    expect(where.sql).toContain("p.is_furnished = ?");
    expect(where.params).toEqual([0, 1]);
  });

  test("bbox, published date and favorites", () => {
    const where = buildPropertyWhere(
      {
        bbox: { north: -23.5, south: -23.6, east: -46.6, west: -46.7 },
        publishedWithin: "LAST_7_DAYS",
        onlyFavorites: true,
      },
      ctx,
    );
    expect(where.sql).toContain("p.lat BETWEEN ? AND ? AND p.lng BETWEEN ? AND ?");
    expect(where.params).toEqual([-23.6, -23.5, -46.7, -46.6, ctx.now - 7 * 86_400_000, "u1"]);
  });
});
