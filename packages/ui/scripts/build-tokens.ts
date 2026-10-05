import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderTokensCss } from "../src/tokens/tokens.ts";

const target = join(import.meta.dir, "..", "src", "tokens", "tokens.css");
writeFileSync(target, renderTokensCss());
console.log(`tokens.css gerado em ${target}`);
