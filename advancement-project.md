# Project Advancement Log

## County GeoJSON — Source & Setup

### What was done

Sourced and prepared the Florida county boundary data needed to render the Layer 1 choropleth heatmap on the map.

### Data source

**Plotly Public Dataset CDN**
`https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json`

- Full US counties GeoJSON (~7 MB)
- Each feature has a FIPS code as its `id` field (e.g. `"12083"` for Marion County FL)
- Properties include: `GEO_ID`, `STATE`, `COUNTY`, `NAME`, `LSAD`, `CENSUSAREA`

**Why this source and not Census.gov directly**
The Census.gov cartographic boundary download server (`www2.census.gov`) was returning HTTP 520 (Cloudflare block) for direct programmatic requests. The Plotly CDN mirrors the same Census TIGER/Line data and is publicly accessible without restriction.

**Original authoritative source (Census TIGER/Line)**
`https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html`
Scale used: 1:500,000 — designed for small-scale thematic mapping (choropleth use case).

---

### Output file

**`public/data/fl-counties.geojson`**

| Property | Value |
|---|---|
| Format | GeoJSON FeatureCollection |
| Feature count | 23 |
| Geometry type | Polygon / MultiPolygon |
| Coordinate system | WGS 84 (longitude/latitude) |
| `id` field | FIPS code string (e.g. `"12095"` for Orange County) |
| `properties.name` | Human-readable county name (e.g. `"Orange"`) |

---

### The 23 target counties (FIPS → Name)

| FIPS | County |
|---|---|
| 12001 | Alachua |
| 12003 | Baker |
| 12009 | Brevard |
| 12017 | Citrus |
| 12019 | Clay |
| 12031 | Duval |
| 12035 | Flagler |
| 12053 | Hernando |
| 12057 | Hillsborough |
| 12061 | Indian River |
| 12069 | Lake |
| 12081 | Manatee |
| 12083 | Marion |
| 12089 | Nassau |
| 12095 | Orange |
| 12097 | Osceola |
| 12101 | Pasco |
| 12105 | Polk |
| 12109 | St. Johns |
| 12111 | St. Lucie |
| 12117 | Seminole |
| 12119 | Sumter |
| 12127 | Volusia |

---

### How it was generated

Script: **`scripts/generate-fl-geojson.mjs`**

Run once to regenerate:
```bash
node scripts/generate-fl-geojson.mjs
```

What the script does:
1. Fetches the full US counties GeoJSON from the Plotly CDN
2. Filters features to the 23 target FIPS codes
3. Adds a `name` property to each feature (human-readable county name)
4. Writes the result to `public/data/fl-counties.geojson`

---

### How the GeoJSON is used in the map (Layer 1)

The file is loaded as a Mapbox **GeoJSON source**. County polygons are colored using `setFeatureState` — the backend returns a metric value (velocity or median price) keyed by FIPS code, and Mapbox paint expressions read that state to drive the choropleth color.

```js
// 1. Add source
map.addSource('fl-counties', {
  type: 'geojson',
  data: '/data/fl-counties.geojson',
});

// 2. Add choropleth fill layer
map.addLayer({
  id: 'counties-fill',
  type: 'fill',
  source: 'fl-counties',
  paint: {
    'fill-color': [
      'interpolate', ['linear'],
      ['feature-state', 'velocity'], // or 'medianPrice'
      0,  '#f7fbff',
      5,  '#6baed6',
      15, '#08519c',
    ],
    'fill-opacity': 0.75,
  },
});

// 3. After fetching metrics from backend, push to each feature
countyMetrics.forEach(({ fips, velocity, medianPrice }) => {
  map.setFeatureState(
    { source: 'fl-counties', id: fips },
    { velocity, medianPrice }
  );
});
```

---

### Map library decisions

| Decision | Choice | Reason |
|---|---|---|
| Map library | **Mapbox GL JS** | User preference; WebGL rendering, native choropleth support |
| Choropleth method | `setFeatureState` + paint expressions | Native Mapbox pattern; data comes from API not a static CSV so `mapbox-choropleth` library was ruled out |
| Tooltip on hover | `@mapbox-controls/tooltip` | Clean callback-based API, no custom popup boilerplate |
| Box-select example | Discarded | That pattern is for drag-selection, not choropleth drill-down |

---

### Drill-down interaction plan (Layers 1 → 2 → 3)

| Action | Result |
|---|---|
| Hover county | Tooltip: county name + metric value |
| Click county | Highlight + sidebar panel |
| Click county (drill-down) | `flyTo` county bounds → Layer 2 loads subdivision pins |
| Click subdivision pin | Sidebar: subdivision snapshot |
| Click subdivision (drill-down) | `flyTo` subdivision → Layer 3 loads parcel polygons |

Note: `map.doubleClickZoom.disable()` must be called to prevent Mapbox's built-in double-click zoom from conflicting with the drill-down click handler.

---

## Next Steps

- [ ] Step 5: Backend endpoint returns velocity + median price for each of the 23 counties (keyed by FIPS)
- [ ] Step 6: Wire `setFeatureState` to color the choropleth from live API data
- [ ] Layer 2: Subdivision pins GeoJSON source (from Bridge API data)
- [ ] Layer 2: Cluster configuration for subdivision markers
- [ ] Layer 3: Parcel polygon source (from ArcGIS REST → GeoJSON)
