// Token-consistency gate (docs/QUALITY-GATES.md §1).
// Components should use SEMANTIC tokens (bg-primary, text-foreground, …), not
// raw hex or bare brand names. Raw hex / `navy` / `sage` are allowed ONLY where
// the design system is *defined* or in the marketing components that consume
// brand primitives directly:
//   - web/src/app/globals.css      → Tier-1 brand primitives live here by design
//   - web/src/components/site/**   → marketing components may use brand primitives
import { globSync, readFileSync } from "node:fs";

const ALLOW_FILE = "web/src/app/globals.css";
const ALLOW_DIR = "web/src/components/site/";

const files = globSync("web/src/**/*.{ts,tsx,css}");
const hex = /#[0-9a-fA-F]{3,8}\b/;
const brand = /\b(navy|sage)\b/;
const violations = [];

for (const f of files) {
  const norm = f.replaceAll("\\", "/");
  if (norm === ALLOW_FILE || norm.startsWith(ALLOW_DIR)) continue;
  const text = readFileSync(f, "utf8");
  text.split("\n").forEach((line, i) => {
    if (hex.test(line) || brand.test(line)) {
      violations.push(`${f}:${i + 1}  ${line.trim()}`);
    }
  });
}

if (violations.length) {
  console.error(
    "✖ token-consistency: raw hex / raw navy|sage outside the theme file and web/src/components/site:",
  );
  for (const v of violations) console.error("  " + v);
  console.error("Use semantic shadcn tokens (bg-primary, text-foreground, …) instead.");
  process.exit(1);
}
console.log("✓ token-consistency");
