import { describe, expect, test } from "bun:test";
import { createTestApp, getTestDb, gql } from "../../testing/test-app.ts";

const app = createTestApp();
const db = getTestDb();
const USER = { "x-user-id": "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee" };
const OTHER = { "x-user-id": "99999999-8888-4777-8666-555555555555" };

const ADD = `mutation($id: ID!) { addFavorite(propertyId: $id) { id isFavorite } }`;
const REMOVE = `mutation($id: ID!) { removeFavorite(propertyId: $id) { id isFavorite } }`;
const COUNT = `{ favoritesCount }`;
const FAVORITES = `{ searchProperties(filters: { onlyFavorites: true }) { totalCount nodes { id isFavorite } } }`;

type Mutation = {
  addFavorite?: { id: string; isFavorite: boolean };
  removeFavorite?: { id: string; isFavorite: boolean };
};

const activeIds = db
  .query<{ id: number }, []>(
    "SELECT id FROM properties WHERE status = 'ACTIVE' ORDER BY id DESC LIMIT 3",
  )
  .all()
  .map((r) => String(r.id));
const inactiveId = String(
  (
    db
      .query<{ id: number }, []>("SELECT id FROM properties WHERE status <> 'ACTIVE' LIMIT 1")
      .get() as { id: number }
  ).id,
);

describe("favorites", () => {
  test("add marks the property as favorite (idempotent) and counts it", async () => {
    for (let i = 0; i < 2; i++) {
      const body = await gql<Mutation>(app, ADD, { id: activeIds[0] }, USER);
      expect(body.errors).toBeUndefined();
      expect(body.data?.addFavorite).toEqual({ id: activeIds[0] as string, isFavorite: true });
    }
    await gql(app, ADD, { id: activeIds[1] }, USER);
    const count = await gql<{ favoritesCount: number }>(app, COUNT, undefined, USER);
    expect(count.data?.favoritesCount).toBe(2);
  });

  test("favorites are per user", async () => {
    const other = await gql<{ favoritesCount: number }>(app, COUNT, undefined, OTHER);
    expect(other.data?.favoritesCount).toBe(0);
    const anonymous = await gql<{ favoritesCount: number }>(app, COUNT);
    expect(anonymous.data?.favoritesCount).toBe(0);
  });

  test("onlyFavorites lists exactly the user's favorites", async () => {
    const body = await gql<{
      searchProperties: { totalCount: number; nodes: { id: string; isFavorite: boolean }[] };
    }>(app, FAVORITES, undefined, USER);
    expect(body.data?.searchProperties.totalCount).toBe(2);
    expect(body.data?.searchProperties.nodes.map((n) => n.id).sort()).toEqual(
      [activeIds[0], activeIds[1]].sort() as string[],
    );
    expect(body.data?.searchProperties.nodes.every((n) => n.isFavorite)).toBe(true);
  });

  test("remove is idempotent", async () => {
    for (let i = 0; i < 2; i++) {
      const body = await gql<Mutation>(app, REMOVE, { id: activeIds[1] }, USER);
      expect(body.data?.removeFavorite?.isFavorite).toBe(false);
    }
    const never = await gql<Mutation>(app, REMOVE, { id: activeIds[2] }, USER);
    expect(never.errors).toBeUndefined();
    const count = await gql<{ favoritesCount: number }>(app, COUNT, undefined, USER);
    expect(count.data?.favoritesCount).toBe(1);
  });

  test("errors: no user, inactive or unknown property, bad id", async () => {
    const noUser = await gql<Mutation>(app, ADD, { id: activeIds[2] });
    expect(noUser.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");

    const inactive = await gql<Mutation>(app, ADD, { id: inactiveId }, USER);
    expect(inactive.errors?.[0]?.extensions?.code).toBe("NOT_FOUND");

    const unknown = await gql<Mutation>(app, REMOVE, { id: "123" }, USER);
    expect(unknown.errors?.[0]?.extensions?.code).toBe("NOT_FOUND");

    const bad = await gql<Mutation>(app, ADD, { id: "abc" }, USER);
    expect(bad.errors?.[0]?.extensions?.field).toBe("propertyId");
  });
});
