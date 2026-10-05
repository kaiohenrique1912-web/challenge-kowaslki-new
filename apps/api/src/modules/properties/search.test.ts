import { describe, expect, test } from "bun:test";
import { isInsidePolygon, publishedWithinStart } from "@qa/shared";
import { createTestApp, getTestDb, gql, TEST_NOW } from "../../testing/test-app.ts";

const app = createTestApp();
const db = getTestDb();

type Node = {
  id: string;
  type: string;
  salePrice: number;
  monthlyCost: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  parkingSpaces: number;
  isFurnished: boolean;
  nearSubway: boolean;
  isExclusive: boolean;
  isRented: boolean;
  rentalYield: number;
  publishedAt: string;
  location: { lat: number; lng: number };
  neighborhood: { slug: string };
  amenities: { code: string }[];
};

type SearchResult = {
  searchProperties: {
    totalCount: number;
    pageInfo: { endCursor: string | null; hasNextPage: boolean };
    nodes: Node[];
  };
};

const SEARCH = `
  query Search($filters: PropertySearchFilters, $sort: SortOrder, $first: Int, $after: String, $origin: LatLngInput) {
    searchProperties(filters: $filters, sort: $sort, first: $first, after: $after, origin: $origin) {
      totalCount
      pageInfo { endCursor hasNextPage }
      nodes {
        id type salePrice monthlyCost area bedrooms bathrooms suites parkingSpaces
        isFurnished nearSubway isExclusive isRented rentalYield publishedAt
        location { lat lng } neighborhood { slug } amenities { code }
      }
    }
  }`;

async function search(variables: Record<string, unknown>, headers?: Record<string, string>) {
  const body = await gql<SearchResult>(app, SEARCH, variables, headers);
  if (body.errors) throw new Error(body.errors.map((e) => e.message).join("; "));
  return body.data?.searchProperties as SearchResult["searchProperties"];
}

async function searchError(variables: Record<string, unknown>, headers?: Record<string, string>) {
  const body = await gql<SearchResult>(app, SEARCH, variables, headers);
  const error = body.errors?.[0];
  if (!error) throw new Error("esperava erro");
  return { message: error.message, code: error.extensions?.code, field: error.extensions?.field };
}

const sqlCount = (where: string, ...params: (string | number)[]) =>
  (
    db
      .query<{ n: number }, (string | number)[]>(
        `SELECT COUNT(*) AS n FROM properties p WHERE p.status = 'ACTIVE' AND ${where}`,
      )
      .get(...params) as { n: number }
  ).n;

describe("searchProperties — filters", () => {
  test("no filters returns every active property", async () => {
    const result = await search({ first: 5 });
    expect(result.totalCount).toBe(sqlCount("1 = 1"));
    expect(result.nodes).toHaveLength(5);
  });

  const cases: {
    name: string;
    filters: Record<string, unknown>;
    check: (n: Node) => boolean;
    sql: string;
  }[] = [
    {
      name: "price range",
      filters: { price: { min: 500_000, max: 900_000 } },
      check: (n) => n.salePrice >= 500_000 && n.salePrice <= 900_000,
      sql: "p.sale_price BETWEEN 500000 AND 900000",
    },
    {
      name: "condo + IPTU",
      filters: { monthlyCost: { max: 800 } },
      check: (n) => n.monthlyCost <= 800,
      sql: "p.monthly_cost <= 800",
    },
    {
      name: "area",
      filters: { area: { min: 100 } },
      check: (n) => n.area >= 100,
      sql: "p.area >= 100",
    },
    {
      name: "types (OR)",
      filters: { types: ["HOUSE", "CONDO_HOUSE"] },
      check: (n) => n.type === "HOUSE" || n.type === "CONDO_HOUSE",
      sql: "p.type IN ('HOUSE', 'CONDO_HOUSE')",
    },
    {
      name: "bedrooms / bathrooms / suites / parking minimums",
      filters: { minBedrooms: 3, minBathrooms: 2, minSuites: 1, minParkingSpaces: 2 },
      check: (n) => n.bedrooms >= 3 && n.bathrooms >= 2 && n.suites >= 1 && n.parkingSpaces >= 2,
      sql: "p.bedrooms >= 3 AND p.bathrooms >= 2 AND p.suites >= 1 AND p.parking_spaces >= 2",
    },
    {
      name: "furnished = false",
      filters: { furnished: false },
      check: (n) => !n.isFurnished,
      sql: "p.is_furnished = 0",
    },
    {
      name: "near subway + exclusive",
      filters: { nearSubway: true, exclusive: true },
      check: (n) => n.nearSubway && n.isExclusive,
      sql: "p.near_subway = 1 AND p.is_exclusive = 1",
    },
    {
      name: "already rented",
      filters: { rented: true },
      check: (n) => n.isRented,
      sql: "p.is_rented = 1",
    },
    {
      name: "neighborhoods (OR)",
      filters: { neighborhoodSlugs: ["pinheiros", "moema"] },
      check: (n) => ["pinheiros", "moema"].includes(n.neighborhood.slug),
      sql: "p.neighborhood_id IN (SELECT id FROM neighborhoods WHERE slug IN ('pinheiros', 'moema'))",
    },
    {
      name: "bounding box",
      filters: { bbox: { north: -23.55, south: -23.6, east: -46.65, west: -46.72 } },
      check: (n) =>
        n.location.lat <= -23.55 &&
        n.location.lat >= -23.6 &&
        n.location.lng <= -46.65 &&
        n.location.lng >= -46.72,
      sql: "p.lat BETWEEN -23.6 AND -23.55 AND p.lng BETWEEN -46.72 AND -46.65",
    },
    {
      name: "amenities (AND)",
      filters: { amenities: ["POOL", "GYM"] },
      check: (n) => ["POOL", "GYM"].every((c) => n.amenities.some((a) => a.code === c)),
      sql: "EXISTS (SELECT 1 FROM property_amenities a WHERE a.property_id = p.id AND a.amenity_code = 'POOL') AND EXISTS (SELECT 1 FROM property_amenities a WHERE a.property_id = p.id AND a.amenity_code = 'GYM')",
    },
    {
      name: "published in the last 7 days",
      filters: { publishedWithin: "LAST_7_DAYS" },
      check: (n) => Date.parse(n.publishedAt) >= publishedWithinStart("LAST_7_DAYS", TEST_NOW),
      sql: `p.published_at >= ${publishedWithinStart("LAST_7_DAYS", TEST_NOW)}`,
    },
  ];

  for (const c of cases) {
    test(c.name, async () => {
      const result = await search({ filters: c.filters, first: 48 });
      expect(result.totalCount).toBe(sqlCount(c.sql));
      expect(result.totalCount).toBeGreaterThan(0);
      expect(result.nodes.every(c.check)).toBe(true);
    });
  }

  test("rented = false means 'tanto faz'", async () => {
    const all = await search({ first: 0 });
    const notFiltered = await search({ filters: { rented: false }, first: 0 });
    expect(notFiltered.totalCount).toBe(all.totalCount);
  });

  test("filters combine with AND", async () => {
    const result = await search({
      filters: { types: ["APARTMENT"], minBedrooms: 2, price: { max: 1_000_000 } },
      first: 0,
    });
    expect(result.totalCount).toBe(
      sqlCount("p.type = 'APARTMENT' AND p.bedrooms >= 2 AND p.sale_price <= 1000000"),
    );
  });

  test("only favorites of the x-user-id user", async () => {
    const userId = "11111111-2222-4333-8444-555555555555";
    const ids = db
      .query<{ id: number }, []>("SELECT id FROM properties WHERE status = 'ACTIVE' LIMIT 3")
      .all()
      .map((r) => r.id);
    for (const id of ids) {
      db.query(
        "INSERT OR IGNORE INTO favorites (user_id, property_id, created_at) VALUES (?, ?, ?)",
      ).run(userId, id, TEST_NOW);
    }
    const result = await search({ filters: { onlyFavorites: true } }, { "x-user-id": userId });
    expect(result.nodes.map((n) => Number(n.id)).sort()).toEqual([...ids].sort());

    const error = await searchError({ filters: { onlyFavorites: true } });
    expect(error.field).toBe("filters.onlyFavorites");
  });
});

describe("searchProperties — validation", () => {
  test("min price greater than max gives a clear error", async () => {
    const error = await searchError({ filters: { price: { min: 900_000, max: 500_000 } } });
    expect(error).toEqual({
      message: "Valor do imóvel: o valor mínimo não pode ser maior que o máximo.",
      code: "BAD_USER_INPUT",
      field: "filters.price",
    });
  });

  test("unknown neighborhood", async () => {
    const error = await searchError({ filters: { neighborhoodSlugs: ["atlantida"] } });
    expect(error.message).toBe("Bairro não encontrado: atlantida.");
    expect(error.field).toBe("filters.neighborhoodSlugs");
  });

  test("bad bbox, page size and pills", async () => {
    expect(
      (
        await searchError({
          filters: { bbox: { north: -23.6, south: -23.5, east: -46.6, west: -46.7 } },
        })
      ).field,
    ).toBe("filters.bbox");
    expect((await searchError({ first: 100 })).field).toBe("first");
    expect((await searchError({ filters: { minBedrooms: 9 } })).field).toBe("filters.minBedrooms");
  });

  test("invalid cursor and cursor from another sort", async () => {
    expect((await searchError({ after: "lixo" })).field).toBe("after");
    const page = await search({ sort: "PRICE_ASC", first: 2 });
    const error = await searchError({ sort: "NEWEST", after: page.pageInfo.endCursor });
    expect(error.message).toContain("outra ordenação");
  });
});

describe("searchProperties — sorting", () => {
  const isSorted = (values: number[], direction: "asc" | "desc") =>
    values.every(
      (v, i) =>
        i === 0 ||
        (direction === "asc" ? (values[i - 1] as number) <= v : (values[i - 1] as number) >= v),
    );

  const sortCases: { sort: string; value: (n: Node) => number; direction: "asc" | "desc" }[] = [
    { sort: "PRICE_ASC", value: (n) => n.salePrice, direction: "asc" },
    { sort: "PRICE_DESC", value: (n) => n.salePrice, direction: "desc" },
    { sort: "NEWEST", value: (n) => Date.parse(n.publishedAt), direction: "desc" },
    { sort: "RENTAL_YIELD_DESC", value: (n) => n.rentalYield, direction: "desc" },
  ];

  for (const c of sortCases) {
    test(`${c.sort} is ordered across pages`, async () => {
      const page1 = await search({ sort: c.sort, first: 30, filters: { minBedrooms: 2 } });
      const page2 = await search({
        sort: c.sort,
        first: 30,
        filters: { minBedrooms: 2 },
        after: page1.pageInfo.endCursor,
      });
      expect(isSorted([...page1.nodes, ...page2.nodes].map(c.value), c.direction)).toBe(true);
    });
  }

  test("RELEVANCE follows relevance_score", async () => {
    const result = await search({ first: 40 });
    const scores = result.nodes.map(
      (n) =>
        (
          db
            .query<{ s: number }, [number]>(
              "SELECT relevance_score AS s FROM properties WHERE id = ?",
            )
            .get(Number(n.id)) as { s: number }
        ).s,
    );
    expect(isSorted(scores, "desc")).toBe(true);
  });

  test("NEAREST orders by distance from the origin (explicit or neighborhood center)", async () => {
    const origin = { lat: -23.5505, lng: -46.6333 };
    const cos = Math.cos((origin.lat * Math.PI) / 180);
    const distance = (n: Node) =>
      (n.location.lat - origin.lat) ** 2 + ((n.location.lng - origin.lng) * cos) ** 2;
    const page1 = await search({ sort: "NEAREST", origin, first: 25 });
    const page2 = await search({
      sort: "NEAREST",
      origin,
      first: 25,
      after: page1.pageInfo.endCursor,
    });
    expect(isSorted([...page1.nodes, ...page2.nodes].map(distance), "asc")).toBe(true);

    // Sem origem: centro do bairro filtrado.
    const center = db
      .query<{ lat: number; lng: number }, []>(
        "SELECT center_lat AS lat, center_lng AS lng FROM neighborhoods WHERE slug = 'moema'",
      )
      .get() as { lat: number; lng: number };
    const byNeighborhood = await search({
      sort: "NEAREST",
      filters: { neighborhoodSlugs: ["moema"] },
      first: 1,
    });
    const explicit = await search({
      sort: "NEAREST",
      filters: { neighborhoodSlugs: ["moema"] },
      origin: center,
      first: 1,
    });
    expect(byNeighborhood.nodes[0]?.id).toBe(explicit.nodes[0]?.id);
  });
});

describe("searchProperties — pagination", () => {
  test("walking every page returns each result exactly once", async () => {
    const filters = { types: ["CONDO_HOUSE"], minBedrooms: 3 };
    const seen: string[] = [];
    let after: string | null = null;
    let total = 0;
    for (let guard = 0; guard < 100; guard++) {
      const page: SearchResult["searchProperties"] = await search({
        filters,
        first: 48,
        after,
        sort: "PRICE_ASC",
      });
      total = page.totalCount;
      seen.push(...page.nodes.map((n) => n.id));
      if (!page.pageInfo.hasNextPage) break;
      after = page.pageInfo.endCursor;
    }
    expect(seen.length).toBe(total);
    expect(new Set(seen).size).toBe(total);
  });

  test("first: 0 only counts", async () => {
    const result = await search({ first: 0, filters: { minBedrooms: 4 } });
    expect(result.nodes).toEqual([]);
    expect(result.pageInfo.hasNextPage).toBe(false);
    expect(result.totalCount).toBe(sqlCount("p.bedrooms >= 4"));
  });
});

describe("property(id)", () => {
  const DETAIL = `query($id: ID!) { property(id: $id) {
    id title headline street amenities { code } unavailableAmenities { code }
    photos { url position } photoCount badges neighborhood { name } isFavorite
  } }`;

  test("returns an active property with derived fields", async () => {
    const row = db
      .query<{ id: number; type: string; photo_count: number }, []>(
        "SELECT id, type, photo_count FROM properties WHERE status = 'ACTIVE' LIMIT 1",
      )
      .get() as { id: number; type: string; photo_count: number };
    const body = await gql<{
      property: Record<string, unknown> & {
        amenities: { code: string }[];
        unavailableAmenities: { code: string }[];
        photos: unknown[];
      };
    }>(app, DETAIL, { id: String(row.id) });
    const property = body.data?.property;
    expect(property?.id).toBe(String(row.id));
    expect(property?.photos).toHaveLength(row.photo_count);
    expect(property?.isFavorite).toBe(false);
    const owned = new Set(property?.amenities.map((a) => a.code));
    expect(property?.unavailableAmenities.some((a) => owned.has(a.code))).toBe(false);
  });

  test("inactive, draft and unknown ids return null", async () => {
    const inactive = db
      .query<{ id: number }, []>("SELECT id FROM properties WHERE status <> 'ACTIVE' LIMIT 1")
      .get() as { id: number };
    for (const id of [String(inactive.id), "999", "abc"]) {
      const body = await gql<{ property: unknown }>(app, DETAIL, { id });
      expect(body.errors).toBeUndefined();
      expect(body.data?.property).toBeNull();
    }
  });

  test("área desenhada: só imóveis dentro do polígono (mesma conta de isInsidePolygon)", async () => {
    // Triângulo sobre a zona oeste: o retângulo dele tem imóveis fora do triângulo.
    const polygon = [
      { lat: -23.53, lng: -46.73 },
      { lat: -23.53, lng: -46.65 },
      { lat: -23.6, lng: -46.73 },
    ];
    const all = db
      .query<{ lat: number; lng: number }, []>(
        "SELECT lat, lng FROM properties WHERE status = 'ACTIVE'",
      )
      .all();
    const expected = all.filter((p) => isInsidePolygon(p, polygon)).length;
    const inBox = sqlCount("p.lat BETWEEN -23.6 AND -23.53 AND p.lng BETWEEN -46.73 AND -46.65");
    expect(expected).toBeGreaterThan(0);
    expect(expected).toBeLessThan(inBox);

    const result = await search({ filters: { polygon }, first: 48 });
    expect(result.totalCount).toBe(expected);
    for (const node of result.nodes) expect(isInsidePolygon(node.location, polygon)).toBe(true);
  });

  test("área desenhada com menos de 3 pontos é BAD_USER_INPUT", async () => {
    const error = await searchError({ filters: { polygon: [{ lat: -23.5, lng: -46.6 }] } });
    expect(error.code).toBe("BAD_USER_INPUT");
    expect(error.message).toContain("Área desenhada");
  });
});
