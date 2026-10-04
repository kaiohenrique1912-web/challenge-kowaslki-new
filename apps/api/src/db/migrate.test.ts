import { describe, expect, test } from "bun:test";
import { openDatabase } from "./client.ts";
import { runMigrations } from "./migrate.ts";

describe("runMigrations", () => {
  test("applies pending migrations once", () => {
    const db = openDatabase(":memory:");
    expect(runMigrations(db)).toContain("0001_init.sql");
    expect(runMigrations(db)).toEqual([]);

    const tables = db
      .query<{ name: string }, []>(
        "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
      )
      .all()
      .map((t) => t.name);
    expect(tables).toEqual(
      expect.arrayContaining([
        "favorites",
        "neighborhoods",
        "properties",
        "property_amenities",
        "property_photos",
        "schema_migrations",
      ]),
    );
    db.close();
  });
});
