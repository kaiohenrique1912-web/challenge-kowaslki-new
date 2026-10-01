import { describe, expect, test } from "bun:test";
import { isHealthStatus } from "@qa/shared";
import { createApp } from "./app.ts";

describe("GraphQL health", () => {
  test("returns ok", async () => {
    const response = await createApp().handle(
      new Request("http://localhost/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "{ health { status service timestamp } }" }),
      }),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { data?: { health?: unknown }; errors?: unknown };
    expect(body.errors).toBeUndefined();
    expect(isHealthStatus(body.data?.health)).toBe(true);
  });
});
