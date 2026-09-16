/**
 * Builds src/lib/japaneseLessonContent.ts
 * Prefer the enriched pipeline:
 *   node scripts/jp-rich/gen-packs.mjs
 *   node scripts/jp-rich/build-all.mjs
 *
 * This file remains as a thin wrapper so older docs still work.
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rich = path.join(__dirname, "jp-rich/build-all.mjs");
const r = spawnSync(process.execPath, [rich], { stdio: "inherit" });
process.exit(r.status ?? 1);
