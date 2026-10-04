import { describe, expect, test } from "bun:test";
import { formatCep, normalizeText, slugify } from "./text.ts";

describe("text helpers", () => {
  test("normalizeText strips accents and case", () => {
    expect(normalizeText("  São   João ")).toBe("sao joao");
  });

  test("slugify", () => {
    expect(slugify("Freguesia do Ó")).toBe("freguesia-do-o");
    expect(slugify("Jardim Anália Franco")).toBe("jardim-analia-franco");
  });

  test("formatCep pads with zeros", () => {
    expect(formatCep(1_310_100)).toBe("01310-100");
  });
});
