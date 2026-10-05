import { describe, expect, test } from "bun:test";
import { createTestApp } from "../../testing/test-app.ts";

describe("GET /static/photos/:file", () => {
  test("returns a placeholder SVG", async () => {
    const response = await createTestApp().handle(
      new Request("http://localhost/static/photos/living-3.svg"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(await response.text()).toContain("<svg");
  });

  test("404 for unknown files", async () => {
    const response = await createTestApp().handle(
      new Request("http://localhost/static/photos/garage-9.svg"),
    );
    expect(response.status).toBe(404);
  });
});
