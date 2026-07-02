import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const DISH_DIR = join(ROOT, "dish");

export function loadDishesFromDir(dir = DISH_DIR) {
  const indexPath = join(dir, "index.json");
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  const dishes = [];
  for (const entry of index.dishes || []) {
    const id = entry.id;
    const filePath = join(dir, `${id}.json`);
    dishes.push(JSON.parse(readFileSync(filePath, "utf8")));
  }
  return dishes;
}

export function writeDishDatabase(recipes, dir = DISH_DIR) {
  mkdirSync(dir, { recursive: true });
  for (const recipe of recipes) {
    writeFileSync(join(dir, `${recipe.id}.json`), JSON.stringify(recipe, null, 2) + "\n", "utf8");
  }
  const index = {
    version: 1,
    description: "SmartCook built-in dish database — one JSON file per recipe",
    dishes: recipes.map((r) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
    })),
  };
  writeFileSync(join(dir, "index.json"), JSON.stringify(index, null, 2) + "\n", "utf8");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const legacyPath = join(ROOT, "php-site", "data", "recipes.json");
  const recipes = JSON.parse(readFileSync(legacyPath, "utf8"));
  writeDishDatabase(recipes);
  console.log(`Wrote ${recipes.length} dishes to ${DISH_DIR}`);
}
