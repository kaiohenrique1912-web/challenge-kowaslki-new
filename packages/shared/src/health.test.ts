import { describe, expect, test } from "bun:test";
import { isHealthStatus } from "./health.ts";

describe("isHealthStatus", () => {
  test("accepts a valid payload", () => {
    expect(
      isHealthStatus({ status: "ok", service: "api", timestamp: "2026-10-01T00:00:00.000Z" }),
    ).toBe(true);
  });

  test("rejects invalid payloads", () => {
    expect(isHealthStatus(null)).toBe(false);
    expect(isHealthStatus({ status: "down", service: "api", timestamp: "x" })).toBe(false);
    expect(isHealthStatus({ status: "ok", service: 1, timestamp: "x" })).toBe(false);
  });
});
