/**
 * Sync public/data/invest-market-snapshot.json from investUniverse.
 * Run: npx tsx scripts/sync-invest-snapshot.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import {
  buildEducationalUniverseSnapshot,
  universeStats,
} from "../src/lib/investUniverse";

const root = process.cwd();
const outDir = path.join(root, "public", "data");
const outFile = path.join(outDir, "invest-market-snapshot.json");

mkdirSync(outDir, { recursive: true });
const snapshot = buildEducationalUniverseSnapshot();
writeFileSync(outFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
const stats = universeStats();
console.log(
  `Wrote ${outFile} — indices=${stats.indices} HK=${stats.hkNames} US=${stats.usNames} demo=${stats.demoNames} totalNames=${stats.totalNames}`
);
