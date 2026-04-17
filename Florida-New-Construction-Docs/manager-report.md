# Florida New Construction Analytics Platform — Manager Report

**Date:** April 9, 2026
**Status:** Layer 1 MVP — Functional with mock data, Bridge API integration scaffolded

---

## What the App Does

An interactive web dashboard that tracks new residential construction activity across **23 Florida counties**. It displays a color-coded map (choropleth heatmap) with two core analytics:

1. **Sales Velocity (Absorption Rate)** — how fast available inventory is being sold each month
2. **Median Close Price** — median sale price of closed transactions

![Switch velocity and median](image-1.png)
Users can filter by **home type** (Single-Family Home vs. Townhome) and switch between the two metrics. Clicking a county pulls up a detail card with full stats and month-over-month trends.

## ![Switch type of building(TownHome | SFM )](image.png)

## What Each Color Means

### Velocity / Absorption Rate Map

| Color                | Rate | Market Signal          |
| -------------------- | ---- | ---------------------- |
| Dark Red `#3a1f2a`   | ~0%  | Cold — very slow sales |
| Red `#c0392b`        | ~3%  | Slow market (below 5%) |
| Orange `#e67e22`     | ~7%  | Moderate (5–10%)       |
| Green `#27ae60`      | ~12% | Hot market (above 10%) |
| Dark Green `#00875a` | 20%+ | Very hot — high demand |

![Absorbtion Rate](image-2.png)

### Median Price Map

| Color                 | Price Range | Segment    |
| --------------------- | ----------- | ---------- |
| Dark Blue `#0d3d5c`   | ~$250k      | Affordable |
| Medium Blue `#1478a0` | ~$350k      | Mid-range  |
| Cyan `#00b4c8`        | ~$450k      | Upper mid  |
| Light Cyan `#8cddd6`  | $600k+      | Premium    |

![Median Rate](image-3.png)

## Data: Where It Comes From

### Primary Source — Bridge Data Output (MLS Feed)

The app is wired to **Bridge Interactive's RESO Web API** (OData format), which aggregates MLS listings from:

- **Stellar MLS** — covers Central & Southwest Florida
- **NE Florida MLS** — covers the Jacksonville metro area

For each county, the backend makes **3 parallel API calls** per request:

1. Active listings count (current inventory)
2. Closed sales this month (with close prices)
3. Closed sales last month (for month-over-month delta)

All metric computation (absorption rate, median price, velocity tier) happens server-side in Node.js — not on the frontend.

### Fallback — Mock Data

When Bridge credentials are not configured, the app automatically uses realistic mock data covering all 23 counties (March 2026 figures), with realistic SFH vs. Townhome differentials (~12% lower prices and absorption for townhomes).

---

## Bridge API Feasibility Assessment

| Aspect                   | Status              | Notes                                                                                                                     |
| ------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **API Integration Code** | ✅ Complete         | `bridge-heatmap.service.ts` fully implemented                                                                             |
| **Authentication**       | ✅ Ready            | Bearer token via env variable `BRIDGE_SERVER_TOKEN`                                                                       |
| **Query Design**         | ✅ Solid            | OData `$filter`, `$select`, pagination with 10k record safety cap                                                         |
| **Active Inventory**     | ✅ Direct           | Filter by `StandardStatus eq 'Active'`                                                                                    |
| **Closed Sales**         | ✅ Direct           | Filter by `CloseDate` date range window                                                                                   |
| **Absorption Rate**      | ✅ Computed         | Formula: Closed / (Active + Closed) × 100                                                                                 |
| **Median Price**         | ✅ Computed         | Server-side sorted median of `ClosePrice` values                                                                          |
| **MoM Deltas**           | ✅ Computed         | Prior month fetched in parallel                                                                                           |
| **Property Type**        | ⚠️ Needs Validation | SFH = `'Residential'`, Townhome = `'Residential Income'` — field values must be confirmed per MLS                         |
| **Missing Credentials**  | ⚠️ Blocker          | `BRIDGE_DATASET_ID` and `BRIDGE_SERVER_TOKEN` are empty; live data requires these                                         |
| **Field Availability**   | ⚠️ Needs Check      | `ClosePrice` and `CloseDate` availability depends on MLS feed permissions — must validate via Bridge `$metadata` endpoint |

**Bottom line:** The integration is architecturally complete and ready to go live the moment Bridge credentials are supplied. The main risk is MLS field availability (close price/date may be restricted on some feeds) and confirming the correct `PropertyType` values for townhomes in each MLS.

---

## Covered Counties (23 Total)

| Region               | Counties                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Central/Southwest FL | Orange, Osceola, Seminole, Lake, Polk, Hillsborough, Manatee, Pasco, Hernando, Brevard, Volusia, Citrus, Marion, Sumter |
| Northeast FL         | Duval, St. Johns, Clay, Nassau, Baker, Alachua, Flagler                                                                 |
| Treasure Coast       | St. Lucie, Indian River                                                                                                 |

### County Geolocation Source

The map polygon boundaries for all 23 counties are **generated once** via a script and stored locally at `public/data/fl-counties.geojson`.

**How it works (`scripts/generate-fl-geojson.mjs`):**

1. Fetches the full US counties GeoJSON dataset (~7 MB) from a public Plotly/GitHub CDN
2. Filters it down to only the 23 target Florida counties by FIPS code
3. Injects the county name into each feature's `properties`
4. Writes the result to `public/data/fl-counties.geojson`

**Source URL:**

```text
https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json
```

**Run once with:**

```bash
node scripts/generate-fl-geojson.mjs
```

The output file is already committed to the repo — this script only needs to be re-run if the county list changes.

---

### County Index — FIPS Codes

Each county is identified internally by its **US Census Bureau FIPS code**, used to match GeoJSON map polygons to API data.

| #   | County       | FIPS Code | Region               |
| --- | ------------ | --------- | -------------------- |
| 1   | Alachua      | 12001     | Northeast FL         |
| 2   | Baker        | 12003     | Northeast FL         |
| 3   | Brevard      | 12009     | Central/Southwest FL |
| 4   | Citrus       | 12017     | Central/Southwest FL |
| 5   | Clay         | 12019     | Northeast FL         |
| 6   | Duval        | 12031     | Northeast FL         |
| 7   | Flagler      | 12035     | Northeast FL         |
| 8   | Hernando     | 12053     | Central/Southwest FL |
| 9   | Hillsborough | 12057     | Central/Southwest FL |
| 10  | Indian River | 12061     | Treasure Coast       |
| 11  | Lake         | 12069     | Central/Southwest FL |
| 12  | Manatee      | 12081     | Central/Southwest FL |
| 13  | Marion       | 12083     | Central/Southwest FL |
| 14  | Nassau       | 12089     | Northeast FL         |
| 15  | Orange       | 12095     | Central/Southwest FL |
| 16  | Osceola      | 12097     | Central/Southwest FL |
| 17  | Pasco        | 12101     | Central/Southwest FL |
| 18  | Polk         | 12105     | Central/Southwest FL |
| 19  | St. Johns    | 12109     | Northeast FL         |
| 20  | St. Lucie    | 12111     | Treasure Coast       |
| 21  | Seminole     | 12117     | Central/Southwest FL |
| 22  | Sumter       | 12119     | Central/Southwest FL |
| 23  | Volusia      | 12127     | Central/Southwest FL |

---

## Tech Stack

| Layer              | Technology                         |
| ------------------ | ---------------------------------- |
| Frontend Framework | Next.js 16 / React 19              |
| Map Rendering      | Mapbox GL JS v3 (WebGL choropleth) |
| State Management   | Redux Toolkit                      |
| Data Fetching      | React Query (5-min cache)          |
| Styling            | Tailwind CSS                       |
| Backend API        | Next.js API Routes (Node.js)       |

---

## Current Build Status

| Item                                | Status                                                         |
| ----------------------------------- | -------------------------------------------------------------- |
| Choropleth map with 23 counties     | ✅ Done                                                        |
| Velocity ↔ Median Price toggle     | ✅ Done                                                        |
| SFH ↔ Townhome toggle              | ✅ Done                                                        |
| County ranking list with MoM deltas | ✅ Done                                                        |
| County spotlight detail card        | ✅ Done                                                        |
| Mock data (fully functional)        | ✅ Done                                                        |
| Bridge API integration scaffolded   | ✅ Done                                                        |
| Bridge credentials connected        | ❌ Pending — needs `BRIDGE_DATASET_ID` + `BRIDGE_SERVER_TOKEN` |
| Live data validation                | ❌ Pending                                                     |
| Layer 2 (county drill-down)         | 🔲 Planned — next phase                                        |
| Layer 3 (subdivision snapshot)      | 🔲 Planned — future                                            |
| Layer 4 (historical time-series)    | 🔲 Planned — future                                            |

-> If you use cousub, you will get many extra smaller polygons and the map logic will be wrong
