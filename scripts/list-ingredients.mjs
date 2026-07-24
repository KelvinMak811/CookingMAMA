import fs from "fs";
import path from "path";

const dir = "src/data/recipes";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
const ingredients = new Map();

for (const f of files) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const blocks = [...t.matchAll(/ingredients:\s*\[([\s\S]*?)\]/g)];
  for (const b of blocks) {
    for (const m of b[1].matchAll(/name:\s*["']([^"']+)["']/g)) {
      ingredients.set(m[1], (ingredients.get(m[1]) || 0) + 1);
    }
  }
}

const sorted = [...ingredients.entries()].sort((a, b) => b[1] - a[1]);
console.log(sorted.map(([n, c]) => `${c}\t${n}`).join("\n"));
console.log(`\nTOTAL unique: ${sorted.length}`);
