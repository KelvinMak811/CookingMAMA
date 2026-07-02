import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { recipes } from "../src/data/recipes";

const dishDir = join(process.cwd(), "dish");
mkdirSync(dishDir, { recursive: true });

for (const recipe of recipes) {
  writeFileSync(
    join(dishDir, `${recipe.id}.json`),
    `${JSON.stringify(recipe, null, 2)}\n`,
    "utf-8"
  );
}

writeFileSync(
  join(dishDir, "index.json"),
  `${JSON.stringify(
    {
      version: 1,
      description: "SmartCook built-in dish database — one JSON file per recipe",
      dishes: recipes.map((r) => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
      })),
    },
    null,
    2
  )}\n`,
  "utf-8"
);

console.log(`Exported ${recipes.length} dishes to dish/`);
