import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { recipes } from "../src/data/recipes";

const outDir = join(process.cwd(), "php-site", "data");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "recipes.json"),
  JSON.stringify(recipes, null, 2),
  "utf-8"
);
console.log(`Exported ${recipes.length} recipes to php-site/data/recipes.json`);
