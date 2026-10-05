import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderTokensCss } from "./tokens.ts";

describe("tokens", () => {
  test("tokens.css is up to date with tokens.ts (run `bun run tokens` in packages/ui)", () => {
    const css = readFileSync(join(import.meta.dir, "tokens.css"), "utf8").replaceAll("\r\n", "\n");
    expect(css).toBe(renderTokensCss());
  });

  test("components only use declared tokens", () => {
    const declared = new Set(
      [...renderTokensCss().matchAll(/(--qa-[a-z0-9-]+):/g)].map((m) => m[1] as string),
    );
    const glob = new Bun.Glob("**/*.css");
    const unknown: string[] = [];
    for (const file of glob.scanSync({ cwd: join(import.meta.dir, "..") })) {
      if (file.endsWith("tokens.css")) continue;
      const css = readFileSync(join(import.meta.dir, "..", file), "utf8");
      for (const match of css.matchAll(/var\((--qa-[a-z0-9-]+)/g)) {
        if (!declared.has(match[1] as string)) unknown.push(`${file}: ${match[1]}`);
      }
    }
    expect(unknown).toEqual([]);
  });
});
