import { describe, expect, test } from "bun:test";
import { createTestApp, getTestDb, gql } from "../../testing/test-app.ts";

const app = createTestApp();

type Suggestion = {
  kind: string;
  label: string;
  neighborhoodSlug: string | null;
  propertyId: string | null;
};
const SUGGEST = `query($q: String!, $limit: Int) {
  locationSuggestions(query: $q, limit: $limit) { kind label neighborhoodSlug propertyId }
}`;

async function suggest(q: string, limit?: number) {
  const body = await gql<{ locationSuggestions: Suggestion[] }>(app, SUGGEST, { q, limit });
  return body;
}

describe("locationSuggestions", () => {
  test("finds neighborhoods ignoring accents, prefix matches first", async () => {
    const body = await suggest("SAUDE");
    expect(body.data?.locationSuggestions[0]).toEqual({
      kind: "NEIGHBORHOOD",
      label: "Saúde, São Paulo – SP",
      neighborhoodSlug: "saude",
      propertyId: null,
    });
  });

  test("finds streets with the neighborhood", async () => {
    const street = getTestDb()
      .query<{ street: string }, []>(
        "SELECT street FROM properties WHERE status = 'ACTIVE' LIMIT 1",
      )
      .get() as { street: string };
    const term = street.street.split(" ").slice(1).join(" ");
    const body = await suggest(term, 20);
    const match = body.data?.locationSuggestions.find(
      (s) => s.kind === "STREET" && s.label.startsWith(`${street.street},`),
    );
    expect(match).toBeDefined();
    expect(match?.neighborhoodSlug).toBeTruthy();
  });

  test("finds a property by its code", async () => {
    const row = getTestDb()
      .query<{ id: number }, []>("SELECT id FROM properties WHERE status = 'ACTIVE' LIMIT 1")
      .get() as { id: number };
    const body = await suggest(String(row.id));
    expect(body.data?.locationSuggestions).toHaveLength(1);
    expect(body.data?.locationSuggestions[0]?.kind).toBe("PROPERTY_CODE");
    expect(body.data?.locationSuggestions[0]?.propertyId).toBe(String(row.id));
  });

  test("respects the limit and requires 2 characters", async () => {
    expect((await suggest("vila", 3)).data?.locationSuggestions).toHaveLength(3);
    const short = await suggest("a");
    expect(short.errors?.[0]?.message).toBe("Digite pelo menos 2 caracteres.");
  });
});

describe("neighborhoods", () => {
  test("lists all neighborhoods alphabetically with medians", async () => {
    const body = await gql<{ neighborhoods: { name: string; medianPricePerM2: number }[] }>(
      app,
      "{ neighborhoods { name medianPricePerM2 } }",
    );
    const names = body.data?.neighborhoods.map((n) => n.name) ?? [];
    expect(names.length).toBe(102);
    expect([...names].sort((a, b) => a.localeCompare(b, "pt-BR"))).toEqual(names);
  });
});
