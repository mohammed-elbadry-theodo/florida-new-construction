Reading the Project — What the Map Needs to Do
From all three files, I extracted the following concrete map requirements:

Layer 1 — 23-County Choropleth Heatmap
Color-coded county polygons (by velocity, median price, or inventory tier)
GeoJSON/Shapefile county boundaries from ArcGIS or Census TIGER/Line
County-level metric switching (click to change what drives the color)
Layer 2 — Subdivision Map
Polygon boundaries for each qualifying subdivision (from ArcGIS parcel data)
Pin/marker per subdivision centroid (lat/lon from ArcGIS)
Marker clustering when zoomed out (many subdivisions per county)
Click a pin → open a panel (New vs. Resale, Builder Presence)
Layer 3 — Subdivision Detail
Parcel-level polygons (individual lot shapes from ArcGIS)
ArcGIS REST API data feeds directly into the map geometry
Cross-cutting constraints
ArcGIS REST API is the geometry source — the map library must consume ArcGIS services or GeoJSON exports cleanly
Data is pulled, stored in your DB, then rendered — not live-streamed to the map
Florida-scale dataset: 23 counties, potentially thousands of subdivision pins
Interactive drill-down: county → subdivision → lot level
Web app context (REST + JSON stack)
Criteria I Applied
Choropleth support — can it color polygons by a computed metric natively?
GeoJSON polygon rendering — county + subdivision + parcel layers
ArcGIS REST API interop — can it consume ArcGIS tile/feature services directly, or requires conversion?
Performance at Florida scale — WebGL vs. SVG/Canvas matters when rendering thousands of polygons
Marker clustering — built-in or easy plugin for subdivision pins
Drill-down UX — layer switching, zoom-to-feature, click events
Cost / licensing — free open-source vs. paid tier
React ecosystem fit — wrapper availability, maintenance health
Bundle size — matters for a data-heavy dashboard app
Candidate Packages — Ranked by Fit
1. MapLibre GL JS + react-map-gl
Best overall fit.

WebGL rendering — handles thousands of polygons and pins without degrading
First-class GeoJSON layer support (fill layers for choropleth, symbol layers for pins)
Free and open-source (fork of Mapbox GL, no usage caps, no token cost)
react-map-gl gives a clean React wrapper
Choropleth: native via fill-color expressions driven by your metric data
Clustering: built-in via cluster source option
ArcGIS interop: pull GeoJSON from ArcGIS REST → feed directly into a source
Gap: no native ArcGIS tile service support — you convert ArcGIS output to GeoJSON first (which your architecture already does)
2. Mapbox GL JS + react-map-gl
Same capability as MapLibre, better polish, but paid.

Identical API to MapLibre — same reasoning applies
Better satellite imagery and default base tiles
Requires a Mapbox token; free tier has usage limits that may matter at scale
Worth considering only if you need Mapbox's proprietary tile styles or Isochrone API
3. Esri Leaflet + ArcGIS JS API (if ArcGIS-first)
Best fit if you stay inside the Esri ecosystem.

Native ArcGIS REST service consumption — no GeoJSON conversion step
esri-leaflet lets you query ArcGIS Feature Services directly as map layers
Choropleth: supported but more manual than MapLibre
Performance: SVG/Canvas-based (Leaflet core), not WebGL — degrades at parcel-polygon scale
The full ArcGIS JS API (v4.x) is WebGL-based and handles all three layers natively, but it is heavy (~1MB+) and its licensing model complicates redistribution
Best choice only if most of your geometry stays in ArcGIS and you don't want a conversion pipeline
4. Leaflet.js + react-leaflet
Good for Layer 1 and 2, insufficient for Layer 3.

Excellent GeoJSON support, lightweight, huge plugin ecosystem
Choropleth: works via L.geoJSON with style functions — well-documented pattern
Clustering: leaflet.markercluster plugin is the standard
Performance ceiling: SVG/Canvas rendering struggles at parcel-level polygon counts (Layer 3)
No WebGL — if you ever render individual lot polygons across a subdivision, you'll hit frame-rate issues
React wrapper (react-leaflet) is mature
5. Deck.gl (paired with MapLibre or Mapbox base)
Best for data-viz-heavy dashboards, overkill for standard map UX.

WebGL-first, designed for millions of data points
GeoJsonLayer, PolygonLayer, HeatmapLayer, ScatterplotLayer are all native
The real heatmap (point-density) layer is here if you ever need it
Complex to integrate for standard click-to-panel drill-down UX
Typically paired with MapLibre/Mapbox for base tiles — adds bundle weight
Worth it only if Layer 1 becomes a true point-density heatmap rather than a choropleth
6. Google Maps JS API
Not recommended.

GeoJSON layer support exists but choropleth styling is limited and verbose
No native polygon clustering
Paid from the first meaningful usage volume
ArcGIS interop requires full GeoJSON conversion pipeline (same as MapLibre, but without MapLibre's advantages)
Summary Table
Package	Choropleth	ArcGIS interop	WebGL perf	Clustering	React wrapper	Cost
MapLibre GL JS	Native	GeoJSON conversion	Yes	Built-in	react-map-gl	Free
Mapbox GL JS	Native	GeoJSON conversion	Yes	Built-in	react-map-gl	Paid tier
Esri Leaflet / ArcGIS JS	Manual / Native	Native REST	ArcGIS JS only	Plugin	Limited	Mixed
Leaflet.js	Manual	GeoJSON conversion	No	Plugin	react-leaflet	Free
Deck.gl	Native	GeoJSON conversion	Yes	Built-in	@deck.gl/react	Free
Google Maps	Limited	GeoJSON conversion	No	Limited	@react-google-maps/api	Paid
My Recommendation
Start with MapLibre GL JS + react-map-gl.

It hits every requirement — choropleth, clustering, WebGL performance for parcel-level polygons, free licensing, and a clean React integration. Your architecture already converts ArcGIS output to GeoJSON before it reaches the frontend, so the only "gap" in ArcGIS native support is not actually a gap given your data pipeline.

If the ArcGIS Feature Service integration ends up being more complex than expected and you want to query ArcGIS layers directly from the map without a conversion step, then Esri Leaflet becomes a strong secondary option for Layers 1–2 (with the understanding that Layer 3 parcel rendering may need a WebGL fallback).