import { execSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = process.cwd();
const PHP_SITE = join(ROOT, "php-site");
const OUT = join(ROOT, "out");
const BASE = "/CookingMAMA";

function renderPhp(scriptName, params, outRelativePath) {
  const outFile = join(OUT, outRelativePath);
  mkdirSync(join(outFile, ".."), { recursive: true });

  const wrapperPath = join(tmpdir(), `smartcook-render-${Date.now()}-${Math.random().toString(36).slice(2)}.php`);
  const getLines = Object.entries(params)
    .map(([key, value]) => `$_GET[${JSON.stringify(key)}] = ${JSON.stringify(String(value))};`)
    .join("\n");

  const wrapper = `<?php
chdir(${JSON.stringify(PHP_SITE)});
${getLines}
$_SERVER['PHP_SELF'] = ${JSON.stringify(scriptName)};
include ${JSON.stringify(scriptName)};
`;

  writeFileSync(wrapperPath, wrapper, "utf8");

  try {
    const html = execSync(`php "${wrapperPath}"`, {
      env: {
        ...process.env,
        SMARTCOOK_BASE_PATH: BASE,
        SMARTCOOK_STATIC: "1",
      },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (!html.includes("<!DOCTYPE html>")) {
      throw new Error(`Invalid HTML output for ${scriptName}`);
    }

    writeFileSync(outFile, html, "utf8");
    console.log(`  ${outRelativePath}`);
  } finally {
    try {
      rmSync(wrapperPath, { force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}

console.log("Building static site for GitHub Pages...");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

cpSync(join(PHP_SITE, "assets"), join(OUT, "assets"), { recursive: true });
cpSync(join(PHP_SITE, "data"), join(OUT, "data"), { recursive: true });
writeFileSync(join(OUT, ".nojekyll"), "");

const recipes = JSON.parse(
  readFileSync(join(PHP_SITE, "data", "recipes.json"), "utf8")
);

renderPhp("recipes.php", {}, "recipes/index.html");
renderPhp("shopping-list.php", {}, "shopping-list/index.html");
renderPhp("history.php", {}, "history/index.html");
renderPhp("expenses.php", {}, "expenses/index.html");

for (const cuisine of ["chinese", "western", "japanese", "italian"]) {
  renderPhp(
    "recipes-cuisine.php",
    { cuisine },
    `recipes/cuisine/${cuisine}/index.html`
  );
}

for (const recipe of recipes) {
  renderPhp("recipe.php", { id: recipe.id }, `recipes/${recipe.id}/index.html`);
}

const indexHtml = `<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${BASE}/recipes/">
  <script>location.replace(${JSON.stringify(`${BASE}/recipes/`)});</script>
  <title>SmartCook</title>
</head>
<body></body>
</html>`;

writeFileSync(join(OUT, "index.html"), indexHtml, "utf8");
cpSync(join(OUT, "recipes/index.html"), join(OUT, "404.html"));

console.log(`Done — ${recipes.length} recipe pages in ${OUT}`);
