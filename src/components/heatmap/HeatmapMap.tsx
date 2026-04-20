"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { COUNTY_NAME_TO_FIPS, FIPS_TO_COUNTY_NAME } from "./fl-counties.config";
import type { CountyMetric, MetricType, SubdivisionPin } from "./types";

import type { FeatureCollection, Point } from "geojson";
import type { MapMouseEvent } from "mapbox-gl";
import type { MapRef } from "react-map-gl/mapbox";
import Map, { Layer, Source } from "react-map-gl/mapbox";

const MAPBOX_TOKEN = process.env["NEXT_PUBLIC_MAPBOX_TOKEN"] ?? "";

const SOURCE_ID = "fl-counties";
const FILL_ID = "fl-counties-fill";
const LINE_ID = "fl-counties-line";
const GEOJSON_URL = "/data/fl-counties.geojson";

const COUSUB_SOURCE_ID = "fl-cousub";
const COUSUB_FILL_ID = "fl-cousub-fill";
const COUSUB_LINE_ID = "fl-cousub-line";
const COUSUB_URL = "/data/fl-cousub.geojson";

const PINS_SOURCE_ID = "fl-pins";
const PINS_CIRCLE_ID = "fl-pins-circle";

const INITIAL_VIEW = { longitude: -85.9, latitude: 24.6, zoom: 20.3 };
const FLORIDA_BBOX: [number, number, number, number] = [-82.85, 27.1, -79.95, 30.9];
const FLORIDA_BBOX_PADDING = 70;

type LayerPaint = Record<string, unknown>;
type Coord = Coord[] | number[];

const COUNTY_FILL_OPACITY = [
  "case",
  ["boolean", ["feature-state", "selected"], false],
  0.1,
  ["boolean", ["feature-state", "hover"], false],
  0.55,
  ["boolean", ["feature-state", "sidebarHover"], false],
  0.55,
  0.4,
];

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
  "fill-opacity": COUNTY_FILL_OPACITY,
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
  "fill-opacity": COUNTY_FILL_OPACITY,
};

const BORDER_LINE: LayerPaint = {
  "line-color": ["case", ["boolean", ["feature-state", "selected"], false], "#ffffff", "rgba(255,255,255,0.25)"],
  "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2.5, 0.8],
};

const COUSUB_FILL: LayerPaint = {
  "fill-color": "#38bdf8",
  "fill-opacity": [
    "case",
    ["boolean", ["feature-state", "selected"], false],
    0.3,
    ["boolean", ["feature-state", "sidebarHover"], false],
    0.28,
    ["boolean", ["feature-state", "hover"], false],
    0.22,
    0.07,
  ],
};

const COUSUB_LINE: LayerPaint = {
  "line-color": [
    "case",
    ["boolean", ["feature-state", "selected"], false],
    "#ffffff",
    ["boolean", ["feature-state", "sidebarHover"], false],
    "#e0f2fe",
    "#38bdf8",
  ],
  "line-width": [
    "case",
    ["boolean", ["feature-state", "selected"], false],
    2.8,
    ["boolean", ["feature-state", "sidebarHover"], false],
    2.4,
    ["boolean", ["feature-state", "hover"], false],
    1.8,
    1.2,
  ],
  "line-opacity": [
    "case",
    ["boolean", ["feature-state", "selected"], false],
    1,
    ["boolean", ["feature-state", "sidebarHover"], false],
    1,
    0.65,
  ],
};

const PIN_CIRCLE: LayerPaint = {
  "circle-radius": 7,
  "circle-color": "#f59e0b",
  "circle-stroke-width": 2,
  "circle-stroke-color": ["case", ["boolean", ["feature-state", "hover"], false], "#ffffff", "rgba(255,255,255,0.6)"],
  "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.88],
};

function extractCoords(coords: Coord, out: Array<[number, number]>): void {
  if (typeof coords[0] === "number") {
    out.push(coords as [number, number]);
    return;
  }

  for (const child of coords as Coord[]) {
    extractCoords(child, out);
  }
}

function geometryBbox(geometry: { type: string; coordinates: Coord }): [number, number, number, number] {
  const points: Array<[number, number]> = [];
  extractCoords(geometry.coordinates, points);

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of points) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return [minLng, minLat, maxLng, maxLat];
}

const countyBboxCache: Record<string, [number, number, number, number]> = {};

async function loadCountyBboxes(): Promise<void> {
  if (Object.keys(countyBboxCache).length > 0) return;

  try {
    const response = await fetch(GEOJSON_URL);
    const geojson = (await response.json()) as {
      features: Array<{ id: string; geometry: { type: string; coordinates: Coord } }>;
    };

    for (const feature of geojson.features) {
      countyBboxCache[feature.id] = geometryBbox(feature.geometry);
    }
  } catch {
    // Non-fatal: the map can still render without fitBounds support.
  }
}

interface HeatmapMapProps {
  counties: CountyMetric[];
  activeMetric: MetricType;
  selectedCounty: string | null;
  hoveredCountyName?: string | null;
  hoveredSubdivisionId?: string | null;
  selectedSubdivisionId?: string | null;
  subdivisions?: SubdivisionPin[];
  onCountyClick: (county: string) => void;
  onSubdivisionSelect: (subdivisionId: string) => void;
  onClearSelection: () => void;
}

type HoverState =
  | {
      kind: "pin";
      posX: number;
      posY: number;
      name: string;
      builder: string;
      absorptionRate: number;
      medianClosePrice: number;
    }
  | { kind: "county"; posX: number; posY: number; county: CountyMetric }
  | { kind: "cousub"; posX: number; posY: number; name: string; namelsad: string };

export default function HeatmapMap({
  counties,
  activeMetric,
  selectedCounty,
  hoveredCountyName,
  hoveredSubdivisionId,
  selectedSubdivisionId,
  subdivisions,
  onCountyClick,
  onSubdivisionSelect,
  onClearSelection,
}: HeatmapMapProps): React.ReactElement {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hover, setHover] = useState<HoverState | null>(null);

  const hoveredCountyId = useRef<string | null>(null);
  const hoveredSubdivisionBoundaryId = useRef<string | null>(null);
  const hoveredPinId = useRef<string | null>(null);
  const sidebarHoveredCountyId = useRef<string | null>(null);
  const sidebarHoveredSubdivisionId = useRef<string | null>(null);
  const selectedCountyId = useRef<string | null>(null);
  const selectedSubdivisionBoundaryId = useRef<string | null>(null);

  const pinsGeoJson = useMemo(
    (): FeatureCollection<Point> => ({
      type: "FeatureCollection",
      features: (subdivisions ?? []).map((subdivision) => ({
        type: "Feature",
        id: subdivision.id,
        geometry: { type: "Point", coordinates: [subdivision.lng, subdivision.lat] },
        properties: {
          name: subdivision.name,
          builder: subdivision.builder,
          absorptionRate: subdivision.absorptionRate,
          medianClosePrice: subdivision.medianClosePrice,
        },
      })),
    }),
    [subdivisions],
  );

  useEffect(() => {
    void loadCountyBboxes();
  }, []);

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

  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current?.getMap();
    if (map === undefined) return;

    if (selectedCountyId.current !== null) {
      map.setFeatureState({ source: SOURCE_ID, id: selectedCountyId.current }, { selected: false });
    }

    const nextCountyId = selectedCounty === null ? null : COUNTY_NAME_TO_FIPS[selectedCounty] ?? null;

    if (nextCountyId !== null) {
      map.setFeatureState({ source: SOURCE_ID, id: nextCountyId }, { selected: true });

      const bbox = countyBboxCache[nextCountyId];
      if (bbox !== undefined) {
        const [minLng, minLat, maxLng, maxLat] = bbox;
        map.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 60, maxZoom: 11, duration: 1200, essential: true },
        );
      }
    } else {
      const [minLng, minLat, maxLng, maxLat] = FLORIDA_BBOX;
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: FLORIDA_BBOX_PADDING, maxZoom: INITIAL_VIEW.zoom, duration: 1000, essential: true },
      );
    }

    selectedCountyId.current = nextCountyId;
  }, [selectedCounty, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current?.getMap();
    if (map === undefined) return;

    if (selectedSubdivisionBoundaryId.current !== null) {
      map.setFeatureState({ source: COUSUB_SOURCE_ID, id: selectedSubdivisionBoundaryId.current }, { selected: false });
    }

    const nextSelectedSubdivisionBoundaryId =
      typeof selectedSubdivisionId === "string" && selectedSubdivisionId !== "" ? selectedSubdivisionId : null;

    if (nextSelectedSubdivisionBoundaryId !== null) {
      map.setFeatureState({ source: COUSUB_SOURCE_ID, id: nextSelectedSubdivisionBoundaryId }, { selected: true });
    }

    selectedSubdivisionBoundaryId.current = nextSelectedSubdivisionBoundaryId;
  }, [selectedSubdivisionId, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current?.getMap();
    if (map === undefined) return;

    if (sidebarHoveredCountyId.current !== null) {
      map.setFeatureState({ source: SOURCE_ID, id: sidebarHoveredCountyId.current }, { sidebarHover: false });
    }

    const nextId =
      hoveredCountyName !== undefined && hoveredCountyName !== null
        ? COUNTY_NAME_TO_FIPS[hoveredCountyName] ?? null
        : null;

    if (nextId !== null) {
      map.setFeatureState({ source: SOURCE_ID, id: nextId }, { sidebarHover: true });
    }

    sidebarHoveredCountyId.current = nextId;
  }, [hoveredCountyName, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current?.getMap();
    if (map === undefined) return;

    if (sidebarHoveredSubdivisionId.current !== null) {
      map.setFeatureState(
        { source: COUSUB_SOURCE_ID, id: sidebarHoveredSubdivisionId.current },
        { sidebarHover: false },
      );
    }

    const nextSidebarHoveredSubdivisionId =
      typeof hoveredSubdivisionId === "string" && hoveredSubdivisionId !== "" ? hoveredSubdivisionId : null;

    if (nextSidebarHoveredSubdivisionId !== null) {
      map.setFeatureState({ source: COUSUB_SOURCE_ID, id: nextSidebarHoveredSubdivisionId }, { sidebarHover: true });
    }

    sidebarHoveredSubdivisionId.current = nextSidebarHoveredSubdivisionId;
  }, [hoveredSubdivisionId, mapLoaded]);

  const onMouseMove = useCallback(
    (event: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (map === undefined) return;

      if (hoveredCountyId.current !== null) {
        map.setFeatureState({ source: SOURCE_ID, id: hoveredCountyId.current }, { hover: false });
      }
      if (hoveredSubdivisionBoundaryId.current !== null) {
        map.setFeatureState({ source: COUSUB_SOURCE_ID, id: hoveredSubdivisionBoundaryId.current }, { hover: false });
      }
      if (hoveredPinId.current !== null) {
        map.setFeatureState({ source: PINS_SOURCE_ID, id: hoveredPinId.current }, { hover: false });
      }

      const feature = event.features?.[0];

      if (feature?.id === undefined) {
        hoveredCountyId.current = null;
        hoveredSubdivisionBoundaryId.current = null;
        hoveredPinId.current = null;
        setHover(null);
        return;
      }

      if (feature.layer?.id === PINS_CIRCLE_ID) {
        const pinId = String(feature.id);
        map.setFeatureState({ source: PINS_SOURCE_ID, id: pinId }, { hover: true });
        hoveredPinId.current = pinId;
        hoveredCountyId.current = null;
        hoveredSubdivisionBoundaryId.current = null;

        const properties = feature.properties as Record<string, unknown>;
        setHover({
          kind: "pin",
          posX: event.point.x,
          posY: event.point.y,
          name: String(properties["name"] ?? ""),
          builder: String(properties["builder"] ?? ""),
          absorptionRate: Number(properties["absorptionRate"] ?? 0),
          medianClosePrice: Number(properties["medianClosePrice"] ?? 0),
        });
        return;
      }

      if (feature.layer?.id === COUSUB_FILL_ID) {
        const boundaryId = String(feature.id);
        map.setFeatureState({ source: COUSUB_SOURCE_ID, id: boundaryId }, { hover: true });
        hoveredSubdivisionBoundaryId.current = boundaryId;
        hoveredCountyId.current = null;
        hoveredPinId.current = null;

        const properties = feature.properties as Record<string, unknown>;
        setHover({
          kind: "cousub",
          posX: event.point.x,
          posY: event.point.y,
          name: String(properties["name"] ?? ""),
          namelsad: String(properties["namelsad"] ?? ""),
        });
        return;
      }

      const countyId = String(feature.id);
      map.setFeatureState({ source: SOURCE_ID, id: countyId }, { hover: true });
      hoveredCountyId.current = countyId;
      hoveredSubdivisionBoundaryId.current = null;
      hoveredPinId.current = null;

      const countyName = FIPS_TO_COUNTY_NAME[countyId];
      const countyData = countyName === undefined ? undefined : counties.find((county) => county.county === countyName);

      if (countyData !== undefined) {
        setHover({ kind: "county", posX: event.point.x, posY: event.point.y, county: countyData });
      } else {
        setHover(null);
      }
    },
    [counties],
  );

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map !== undefined) {
      if (hoveredCountyId.current !== null) {
        map.setFeatureState({ source: SOURCE_ID, id: hoveredCountyId.current }, { hover: false });
        hoveredCountyId.current = null;
      }
      if (hoveredSubdivisionBoundaryId.current !== null) {
        map.setFeatureState({ source: COUSUB_SOURCE_ID, id: hoveredSubdivisionBoundaryId.current }, { hover: false });
        hoveredSubdivisionBoundaryId.current = null;
      }
      if (hoveredPinId.current !== null) {
        map.setFeatureState({ source: PINS_SOURCE_ID, id: hoveredPinId.current }, { hover: false });
        hoveredPinId.current = null;
      }
    }

    setHover(null);
  }, []);

  const onClick = useCallback(
    (event: MapMouseEvent) => {
      const feature = event.features?.[0];

      if (feature?.id === undefined) {
        onClearSelection();
        return;
      }

      if (feature.layer?.id === PINS_CIRCLE_ID) return;

      if (feature.layer?.id === COUSUB_FILL_ID) {
        onSubdivisionSelect(String(feature.id));
        return;
      }

      const countyName = FIPS_TO_COUNTY_NAME[String(feature.id)];
      if (countyName !== undefined) onCountyClick(countyName);
    },
    [onCountyClick, onSubdivisionSelect, onClearSelection],
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
  const countySubdivisionFilter =
    selectedCounty !== null ? (["==", ["get", "countyName"], selectedCounty] as never) : (["boolean", false] as never);

  return (
    <div className="relative size-full">
      <Map
        ref={mapRef}
        minZoom={2}
        bounds={[
          [-82.85, 27.1],
          [-79.95, 30.9],
        ]}
        maxBounds={[
          [-85.968018, 24.816654],
          [-78.650146, 31.082161],
        ]}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        initialViewState={INITIAL_VIEW}
        interactiveLayerIds={[FILL_ID, COUSUB_FILL_ID, PINS_CIRCLE_ID]}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onLoad={() => {
          mapRef.current?.getMap().doubleClickZoom.disable();
          setMapLoaded(true);
        }}
        onError={(event) => {
          // eslint-disable-next-line no-console
          console.error("[HeatmapMap]", event.error.message);
        }}
        style={{ width: "100%", height: "100%" }}
        cursor={hover !== null ? "pointer" : "grab"}
      >
        <Source id={SOURCE_ID} type="geojson" data={GEOJSON_URL} generateId={false}>
          <Layer id={FILL_ID} type="fill" paint={fillPaint as never} />
          <Layer id={LINE_ID} type="line" paint={BORDER_LINE as never} />
        </Source>

        <Source id={COUSUB_SOURCE_ID} type="geojson" data={COUSUB_URL} generateId={false}>
          <Layer id={COUSUB_FILL_ID} type="fill" paint={COUSUB_FILL as never} filter={countySubdivisionFilter} />
          <Layer id={COUSUB_LINE_ID} type="line" paint={COUSUB_LINE as never} filter={countySubdivisionFilter} />
        </Source>

        <Source id={PINS_SOURCE_ID} type="geojson" data={pinsGeoJson}>
          <Layer id={PINS_CIRCLE_ID} type="circle" paint={PIN_CIRCLE as never} />
        </Source>
      </Map>

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
              {[
                { color: "#c0392b", label: "<5% - Slow market" },
                { color: "#e67e22", label: "5-10% - Moderate" },
                { color: "#27ae60", label: "10%+ - Hot market" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-gray-400">{label}</span>
                </div>
              ))}
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
              {[
                { color: "#0d3d5c", label: "<$300k - Affordable" },
                { color: "#1478a0", label: "$300-450k - Mid" },
                { color: "#8cddd6", label: "$450k+ - Premium" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {hover !== null &&
        (hover.kind === "pin" ? (
          <div
            className="pointer-events-none absolute z-20 min-w-40 rounded-lg border border-white/10 bg-gray-900/95 p-3 shadow-xl"
            style={{ left: hover.posX + 14, top: hover.posY - 14 }}
          >
            <p className="mb-0.5 text-xs font-bold text-white">{hover.name}</p>
            <p className="text-[10px] text-gray-500">{hover.builder}</p>
            <p className="mt-1.5 text-xs text-gray-400">
              Absorption: <span className="font-semibold text-white">{hover.absorptionRate.toFixed(1)}%</span>
            </p>
            <p className="text-xs text-gray-400">
              Median: <span className="font-semibold text-white">${hover.medianClosePrice.toLocaleString()}</span>
            </p>
          </div>
        ) : hover.kind === "cousub" ? (
          <div
            className="pointer-events-none absolute z-20 rounded-lg border border-white/10 bg-gray-900/95 px-3 py-2 shadow-xl"
            style={{ left: hover.posX + 14, top: hover.posY - 14 }}
          >
            <p className="text-xs font-bold text-white">{hover.namelsad !== "" ? hover.namelsad : hover.name}</p>
            <p className="text-[10px] text-gray-500">County subdivision boundary</p>
          </div>
        ) : (
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
        ))}
    </div>
  );
}
