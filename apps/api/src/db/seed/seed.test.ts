import type { Database } from "bun:sqlite";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { isAmenityApplicable, propertyInputSchema, SAO_PAULO_BOUNDS } from "@qa/shared";
import { openDatabase } from "../client.ts";
import { runMigrations } from "../migrate.ts";
import { generateDataset } from "./generator.ts";
import { DEFAULT_SEED, DEFAULT_SEED_COUNT, seedDatabase } from "./index.ts";

const NOW = Date.UTC(2026, 9, 1, 12);

describe("generateDataset", () => {
  test("is reproducible for the same seed and changes with another seed", () => {
    const a = generateDataset({ count: 300, seed: 7, now: NOW });
    const b = generateDataset({ count: 300, seed: 7, now: NOW });
    const c = generateDataset({ count: 300, seed: 8, now: NOW });
    expect(b).toEqual(a);
    expect(c.properties).not.toEqual(a.properties);
  });
});

describe(`seed with ${DEFAULT_SEED_COUNT.toLocaleString("pt-BR")} properties`, () => {
  let db: Database;

  beforeAll(() => {
    db = openDatabase(":memory:");
    runMigrations(db);
    seedDatabase(db, { count: DEFAULT_SEED_COUNT, seed: DEFAULT_SEED, now: NOW });
  }, 120_000);

  afterAll(() => db.close());

  const one = <T>(sql: string): T => db.query<T, []>(sql).get() as T;
  const count = (sql: string) => one<{ n: number }>(sql).n;

  test("creates at least 50.000 properties, most of them active", () => {
    expect(count("SELECT COUNT(*) AS n FROM properties")).toBeGreaterThanOrEqual(50_000);
    expect(
      count("SELECT COUNT(*) AS n FROM properties WHERE status = 'ACTIVE'"),
    ).toBeGreaterThanOrEqual(50_000);
  });

  test("every stored property passes the shared validation", () => {
    const rows = db
      .query<Record<string, unknown> & { id: number }, []>(`
        SELECT p.*, (SELECT json_group_array(url) FROM property_photos WHERE property_id = p.id) AS photos,
          (SELECT json_group_array(amenity_code) FROM property_amenities WHERE property_id = p.id) AS amenities
        FROM properties p`)
      .all();
    const invalid = rows.filter((r) => {
      const input = {
        type: r.type,
        cep: r.cep,
        street: r.street,
        number: r.number,
        complement: r.complement,
        neighborhoodId: r.neighborhood_id,
        latitude: r.lat,
        longitude: r.lng,
        salePrice: r.sale_price,
        condoFee: r.condo_fee,
        iptu: r.iptu,
        area: r.area,
        bedrooms: r.bedrooms,
        suites: r.suites,
        bathrooms: r.bathrooms,
        parkingSpaces: r.parking_spaces,
        floor: r.floor,
        isFurnished: r.is_furnished === 1,
        acceptsPets: r.accepts_pets === 1,
        nearSubway: r.near_subway === 1,
        isExclusive: r.is_exclusive === 1,
        isRented: r.is_rented === 1,
        monthlyRent: r.monthly_rent,
        description: r.description,
        amenities: JSON.parse(r.amenities as string).filter(Boolean),
        photos: JSON.parse(r.photos as string).filter(Boolean),
      };
      return !propertyInputSchema.safeParse(input).success;
    });
    expect(invalid.map((r) => r.id)).toEqual([]);
  });

  test("locations are inside São Paulo and reference existing neighborhoods", () => {
    const outside = count(`
      SELECT COUNT(*) AS n FROM properties
      WHERE lat > ${SAO_PAULO_BOUNDS.north} OR lat < ${SAO_PAULO_BOUNDS.south}
         OR lng > ${SAO_PAULO_BOUNDS.east} OR lng < ${SAO_PAULO_BOUNDS.west}`);
    expect(outside).toBe(0);
    expect(db.query("PRAGMA foreign_key_check").all()).toEqual([]);
    expect(count("SELECT COUNT(*) AS n FROM neighborhoods")).toBeGreaterThanOrEqual(90);
  });

  test("price per m² follows the neighborhood (Itaim Bibi > Cidade Tiradentes)", () => {
    const median = (slug: string) =>
      one<{ m: number }>(
        `SELECT median_price_per_m2 AS m FROM neighborhoods WHERE slug = '${slug}'`,
      ).m;
    expect(median("itaim-bibi")).toBeGreaterThan(3 * median("cidade-tiradentes"));
    expect(count("SELECT COUNT(*) AS n FROM neighborhoods WHERE median_price_per_m2 <= 0")).toBe(0);
  });

  test("realistic distributions", () => {
    const share = (where: string) =>
      count(`SELECT COUNT(*) AS n FROM properties WHERE ${where}`) / DEFAULT_SEED_COUNT;
    expect(share("type = 'APARTMENT'")).toBeGreaterThan(0.45);
    expect(share("type = 'HOUSE'")).toBeGreaterThan(0.1);
    expect(share("type = 'STUDIO'")).toBeGreaterThan(0.03);
    expect(share("bedrooms = 2")).toBeGreaterThan(0.2);
    expect(share("is_rented = 1")).toBeLessThan(0.15);
  });

  test("photos and amenities are consistent", () => {
    expect(
      count(`SELECT COUNT(*) AS n FROM properties p
             WHERE photo_count <> (SELECT COUNT(*) FROM property_photos WHERE property_id = p.id)
                OR photo_count < 1`),
    ).toBe(0);
    const pairs = db
      .query<{ type: string; amenity_code: string }, []>(`
        SELECT DISTINCT p.type, a.amenity_code FROM property_amenities a
        JOIN properties p ON p.id = a.property_id`)
      .all();
    const notApplicable = pairs.filter(
      (p) => !isAmenityApplicable(p.amenity_code as never, p.type as never),
    );
    expect(notApplicable).toEqual([]);
  });

  test("derived fields are filled", () => {
    expect(count("SELECT COUNT(*) AS n FROM properties WHERE estimated_rent <= 0")).toBe(0);
    expect(
      count(
        "SELECT COUNT(*) AS n FROM properties WHERE relevance_score < 0 OR relevance_score > 100",
      ),
    ).toBe(0);
    expect(count("SELECT COUNT(*) AS n FROM properties WHERE relevance_score > 0")).toBeGreaterThan(
      0,
    );
    expect(
      count(
        "SELECT COUNT(*) AS n FROM properties WHERE status = 'DRAFT' AND published_at IS NOT NULL",
      ),
    ).toBe(0);
    expect(
      count(
        "SELECT COUNT(*) AS n FROM properties WHERE previous_price IS NOT NULL AND previous_price <= sale_price",
      ),
    ).toBe(0);
  });
});
