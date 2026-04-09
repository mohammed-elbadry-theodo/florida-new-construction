/**
 * Downloads the US counties GeoJSON from a public CDN and filters it to the
 * 23 target Florida counties. Outputs public/data/fl-counties.geojson.
 *
 * Run once:  node scripts/generate-fl-geojson.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(currentDir, "../public/data");
const OUT_FILE = resolve(OUT_DIR, "fl-counties.geojson");

const FIPS_TO_NAME = {
  12001: "Alachua",
  12003: "Baker",
  12009: "Brevard",
  12017: "Citrus",
  12019: "Clay",
  12031: "Duval",
  12035: "Flagler",
  12053: "Hernando",
  12057: "Hillsborough",
  12061: "Indian River",
  12069: "Lake",
  12081: "Manatee",
  12083: "Marion",
  12089: "Nassau",
  12095: "Orange",
  12097: "Osceola",
  12101: "Pasco",
  12105: "Polk",
  12109: "St. Johns",
  12111: "St. Lucie",
  12117: "Seminole",
  12119: "Sumter",
  12127: "Volusia",
};

const TARGET_FIPS = new Set(Object.keys(FIPS_TO_NAME));

const CDN_URL = "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json";

/* eslint-disable no-console */
async function main() {
  console.log("Fetching US counties GeoJSON (~7 MB)…");
  const res = await fetch(CDN_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const full = await res.json();

  const filtered = {
    type: "FeatureCollection",
    features: full.features
      .filter((feature) => TARGET_FIPS.has(feature.id))
      .map((feature) => ({
        ...feature,
        properties: { ...feature.properties, name: FIPS_TO_NAME[feature.id] ?? feature.id },
      })),
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(filtered));
  console.log(`Done — ${filtered.features.length} counties → ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
/* eslint-enable no-console */
