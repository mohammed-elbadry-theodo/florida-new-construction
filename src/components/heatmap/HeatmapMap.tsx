"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { COUNTY_NAME_TO_FIPS, FIPS_TO_COUNTY_NAME } from "./fl-counties.config";
import type { CountyMetric, MetricType } from "./types";

import type { MapMouseEvent } from "mapbox-gl";
import type { MapRef } from "react-map-gl/mapbox";
import Map, { Layer, Source } from "react-map-gl/mapbox";

const MAPBOX_TOKEN = process.env["NEXT_PUBLIC_MAPBOX_TOKEN"] ?? "";

const SOURCE_ID = "fl-counties";
const FILL_ID = "fl-counties-fill";
const LINE_ID = "fl-counties-line";
const GEOJSON_URL = "/data/fl-counties.geojson";

const INITIAL_VIEW = { longitude: -81.5, latitude: 27.8, zoom: 6 };

// ─── Choropleth paint (mapbox-gl v3 expression syntax) ────────────────────────
// Mapbox expression arrays are untyped by design — cast via `as never` at the
// Layer so exactOptionalPropertyTypes is satisfied without eslint-disable.
type LayerPaint = Record<string, unknown>;

const VELOCITY_FILL: LayerPaint = {
  "fill-color": [
    "interpolate",
    ["linear"],
    ["coalesce", ["feature-state", "value"], 0],
    0,
    "#3a1f2a",
    3,
    "#c0392b",
    7,
    "#e67e22",
    12,
    "#27ae60",
    20,
    "#00875a",
  ],
  "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.82],
};

const PRICE_FILL: LayerPaint = {
  "fill-color": [
    "interpolate",
    ["linear"],
    ["coalesce", ["feature-state", "value"], 0],
    250000,
    "#0d3d5c",
    350000,
    "#1478a0",
    450000,
    "#00b4c8",
    600000,
    "#8cddd6",
  ],
  "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.82],
};

const BORDER_LINE: LayerPaint = {
  "line-color": ["case", ["boolean", ["feature-state", "selected"], false], "#ffffff", "rgba(255,255,255,0.25)"],
  "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2.5, 0.8],
};

// ─── Component ────────────────────────────────────────────────────────────────

interface HeatmapMapProps {
  counties: CountyMetric[];
  activeMetric: MetricType;
  selectedCounty: string | null;
  onCountyClick: (county: string) => void;
}

interface HoverState {
  posX: number;
  posY: number;
  county: CountyMetric;
}

export default function HeatmapMap({
  counties,
  activeMetric,
  selectedCounty,
  onCountyClick,
}: HeatmapMapProps): React.ReactElement {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hover, setHover] = useState<HoverState | null>(null);

  const hoveredFips = useRef<string | null>(null);
  const selectedFips = useRef<string | null>(null);

  // ── sync metric values as feature state ──────────────────────────────────
  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current?.getMap();
    if (map === undefined) return;
    for (const county of counties) {
      const fips = COUNTY_NAME_TO_FIPS[county.county];
      if (fips === undefined) continue;
      const value = activeMetric === "velocity" ? county.absorptionRate : county.medianClosePrice;
      map.setFeatureState({ source: SOURCE_ID, id: fips }, { value });
    }
  }, [counties, activeMetric, mapLoaded]);

  // ── sync selected county ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current?.getMap();
    if (map === undefined) return;
    if (selectedFips.current !== null) {
      map.setFeatureState({ source: SOURCE_ID, id: selectedFips.current }, { selected: false });
    }
    const next = selectedCounty === null ? null : COUNTY_NAME_TO_FIPS[selectedCounty] ?? null;
    if (next !== null) map.setFeatureState({ source: SOURCE_ID, id: next }, { selected: true });
    selectedFips.current = next;
  }, [selectedCounty, mapLoaded]);

  // ── hover ─────────────────────────────────────────────────────────────────
  const onMouseMove = useCallback(
    (e: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (map === undefined) return;
      if (hoveredFips.current !== null) {
        map.setFeatureState({ source: SOURCE_ID, id: hoveredFips.current }, { hover: false });
      }
      const feature = e.features?.[0];
      if (feature?.id === undefined) {
        hoveredFips.current = null;
        setHover(null);
      } else {
        const fips = String(feature.id);
        map.setFeatureState({ source: SOURCE_ID, id: fips }, { hover: true });
        hoveredFips.current = fips;
        const countyName = FIPS_TO_COUNTY_NAME[fips];
        const countyData = countyName === undefined ? undefined : counties.find((entry) => entry.county === countyName);
        if (countyData !== undefined) setHover({ posX: e.point.x, posY: e.point.y, county: countyData });
      }
    },
    [counties],
  );

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map !== undefined && hoveredFips.current !== null) {
      map.setFeatureState({ source: SOURCE_ID, id: hoveredFips.current }, { hover: false });
      hoveredFips.current = null;
    }
    setHover(null);
  }, []);

  const onClick = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0];
      if (feature?.id === undefined) return;
      const countyName = FIPS_TO_COUNTY_NAME[String(feature.id)];
      if (countyName !== undefined) onCountyClick(countyName);
    },
    [onCountyClick],
  );

  if (MAPBOX_TOKEN === "") {
    return (
      <div className="flex size-full items-center justify-center text-sm text-gray-500">
        Add{" "}
        <code className="mx-1 rounded-sm bg-gray-800 px-1 py-0.5 text-xs text-gray-300">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
        to .env to display the map.
      </div>
    );
  }

  const fillPaint = activeMetric === "velocity" ? VELOCITY_FILL : PRICE_FILL;

  return (
    <div className="relative size-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        initialViewState={INITIAL_VIEW}
        interactiveLayerIds={[FILL_ID]}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onLoad={() => {
          setMapLoaded(true);
        }}
        onError={(e) => {
          // eslint-disable-next-line no-console
          console.error("[HeatmapMap]", e.error.message);
        }}
        style={{ width: "100%", height: "100%" }}
        cursor={hover === null ? "grab" : "pointer"}
      >
        <Source id={SOURCE_ID} type="geojson" data={GEOJSON_URL} generateId={false}>
          <Layer id={FILL_ID} type="fill" paint={fillPaint as never} />
          <Layer id={LINE_ID} type="line" paint={BORDER_LINE as never} />
        </Source>
      </Map>

      {/* ── color legend ── */}
      <div className="pointer-events-none absolute right-4 bottom-4 z-20 w-44 rounded-lg border border-white/10 bg-gray-900/95 p-3 shadow-xl">
        {activeMetric === "velocity" ? (
          <>
            <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Absorption Rate</p>
            <div
              className="mb-1.5 h-2 w-full rounded-full"
              style={{ background: "linear-gradient(to right, #3a1f2a, #c0392b, #e67e22, #27ae60, #00875a)" }}
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>0% Cold</span>
              <span>20%+ Hot</span>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#c0392b]" />
                <span className="text-[10px] text-gray-400">&lt;5% — Slow market</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#e67e22]" />
                <span className="text-[10px] text-gray-400">5–10% — Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#27ae60]" />
                <span className="text-[10px] text-gray-400">10%+ — Hot market</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Median Close Price</p>
            <div
              className="mb-1.5 h-2 w-full rounded-full"
              style={{ background: "linear-gradient(to right, #0d3d5c, #1478a0, #00b4c8, #8cddd6)" }}
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>$250k Low</span>
              <span>$600k+ High</span>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#0d3d5c]" />
                <span className="text-[10px] text-gray-400">&lt;$300k — Affordable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#1478a0]" />
                <span className="text-[10px] text-gray-400">$300–450k — Mid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#8cddd6]" />
                <span className="text-[10px] text-gray-400">$450k+ — Premium</span>
              </div>
            </div>
          </>
        )}
      </div>

      {hover !== null && (
        <div
          className="pointer-events-none absolute z-20 min-w-45 rounded-lg border border-white/10 bg-gray-900/95 p-3 shadow-xl"
          style={{ left: hover.posX + 14, top: hover.posY - 14 }}
        >
          <p className="mb-1 text-xs font-bold text-white">{hover.county.county} County</p>
          <p className="text-xs text-gray-400">
            Absorption: <span className="font-semibold text-white">{hover.county.absorptionRate.toFixed(1)}%</span>
          </p>
          <p className="text-xs text-gray-400">
            Median Price:{" "}
            <span className="font-semibold text-white">${hover.county.medianClosePrice.toLocaleString()}</span>
          </p>
          <p className="text-xs text-gray-400">
            Closed this month: <span className="font-semibold text-white">{hover.county.closedSalesThisMonth}</span>
          </p>
        </div>
      )}
    </div>
  );
}
