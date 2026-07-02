import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

if (process.env.GITHUB_PAGES !== "true") {
  process.exit(0);
}

const out = "out";
const index = join(out, "index.html");
const notFound = join(out, "404.html");

if (existsSync(index)) {
  copyFileSync(index, notFound);
  console.log("Created 404.html fallback for GitHub Pages");
}
