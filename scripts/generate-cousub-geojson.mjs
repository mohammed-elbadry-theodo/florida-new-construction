/**
 * Converts the Census Bureau county-subdivision shapefile (cb_2024_12_cousub_500k)
 * to GeoJSON, filtered to only the 23 target Florida counties.
 *
 * Run once:  node scripts/generate-cousub-geojson.mjs
 * Output:    public/data/fl-cousub.geojson
 */
import * as shapefile from 'shapefile';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const currentDir = dirname(fileURLToPath(import.meta.url));

const SHP = resolve(
  currentDir,
  '../Florida-New-Construction-Docs/cb_2024_12_cousub_500k/cb_2024_12_cousub_500k.shp',
);
const OUT_DIR = resolve(currentDir, '../public/data');
const OUT_FILE = resolve(OUT_DIR, 'fl-cousub.geojson');

// COUNTYFP (3-digit) → county name for the 23 target counties
const TARGET_COUNTIES = {
  '001': 'Alachua',
  '003': 'Baker',
  '009': 'Brevard',
  '017': 'Citrus',
  '019': 'Clay',
  '031': 'Duval',
  '035': 'Flagler',
  '053': 'Hernando',
  '057': 'Hillsborough',
  '061': 'Indian River',
  '069': 'Lake',
  '081': 'Manatee',
  '083': 'Marion',
  '089': 'Nassau',
  '095': 'Orange',
  '097': 'Osceola',
  '101': 'Pasco',
  '105': 'Polk',
  '109': 'St. Johns',
  '111': 'St. Lucie',
  '117': 'Seminole',
  '119': 'Sumter',
  '127': 'Volusia',
};

/* eslint-disable no-console */
async function main() {
  console.log('Reading shapefile…');

  const source = await shapefile.open(SHP);
  const features = [];

  while (true) {
    const result = await source.read();
    if (result.done) break;

    const feature = result.value;
    const countyFp = feature.properties.COUNTYFP;

    // Keep only features inside the 23 target counties
    if (!TARGET_COUNTIES[countyFp]) continue;

    features.push({
      type: 'Feature',
      // Use GEOID as the stable unique id for setFeatureState
      id: feature.properties.GEOID,
      geometry: feature.geometry,
      properties: {
        geoid:      feature.properties.GEOID,       // "1206993445"
        name:       feature.properties.NAME,         // "Umatilla"
        namelsad:   feature.properties.NAMELSAD,     // "Umatilla CCD"
        countyFp:   countyFp,                        // "069"
        countyFips: `12${countyFp}`,                 // "12069"
        countyName: TARGET_COUNTIES[countyFp],       // "Lake"
        lsad:       feature.properties.LSAD,         // "22" = CCD, "25" = borough, etc.
        aland:      Number(feature.properties.ALAND),
        awater:     Number(feature.properties.AWATER),
      },
    });
  }

  const geojson = {
    type: 'FeatureCollection',
    features,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(geojson));

  console.log(`Done — ${features.length} county subdivisions across ${Object.keys(TARGET_COUNTIES).length} counties → ${OUT_FILE}`);

  // Summary by county
  const byCounty = {};
  for (const f of features) {
    const c = f.properties.countyName;
    byCounty[c] = (byCounty[c] ?? 0) + 1;
  }
  console.log('\nSubdivisions per county:');
  Object.entries(byCounty)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([county, count]) => console.log(`  ${county}: ${count}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
/* eslint-enable no-console */
