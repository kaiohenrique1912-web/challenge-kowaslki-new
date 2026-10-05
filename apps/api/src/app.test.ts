import { describe, expect, test } from "bun:test";
import { isHealthStatus } from "@qa/shared";
import { createTestApp, gql } from "./testing/test-app.ts";

describe("GraphQL health", () => {
  test("returns ok", async () => {
    const body = await gql<{ health: unknown }>(
      createTestApp(),
      "{ health { status service timestamp } }",
    );
    expect(body.errors).toBeUndefined();
    expect(isHealthStatus(body.data?.health)).toBe(true);
  });
});
