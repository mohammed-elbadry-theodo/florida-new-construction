import { useMemo } from "react";

import { COUNTY_SUBDIVISIONS } from "~components/heatmap/county-subdivisions.data";
import type { HomeType, SubdivisionPin, VelocityTier } from "~components/heatmap/types";

import { useQuery } from "react-query";

import useSubdivisionPins from "./useSubdivisionPins";

const STATIC_DATA_STALE_TIME = 60 * 60 * 1000;

type Point = [number, number];
type LinearRing = Point[];
type PolygonCoords = LinearRing[];
type MultiPolygonCoords = PolygonCoords[];

interface CountySubdivisionGeometry {
  type: "MultiPolygon" | "Polygon";
  coordinates: MultiPolygonCoords | PolygonCoords;
}

interface CountySubdivisionFeature {
  id: string;
  geometry: CountySubdivisionGeometry;
  properties: {
    countyName: string;
    name?: string;
    namelsad?: string;
  };
}

interface CountySubdivisionGeoJson {
  features: CountySubdivisionFeature[];
}

export interface CountySubdivisionSummary {
  id: string;
  label: string;
  county: string;
  communityCount: number;
  communities: SubdivisionPin[];
  topBuilders: string[];
  activeInventory: number;
  closedSalesThisMonth: number;
  totalPlatLots: number;
  lotsRemaining: number;
  absorptionRate: number | null;
  absorptionRatePrevMonth: number | null;
  medianClosePrice: number | null;
  medianClosePricePrevMonth: number | null;
  velocityTier: VelocityTier | null;
}

interface CountySubdivisionSummariesQuery {
  loading: boolean;
  summaries: CountySubdivisionSummary[];
}

function computeMedian(values: number[]): number | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((valueA, valueB) => valueA - valueB);
  const midpoint = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return ((sorted[midpoint - 1] ?? 0) + (sorted[midpoint] ?? 0)) / 2;
  }

  return sorted[midpoint] ?? null;
}

function computeAverage(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getVelocityTier(rate: number | null): VelocityTier | null {
  if (rate === null) return null;
  if (rate >= 10) return "high";
  if (rate >= 5) return "medium";
  return "low";
}

function isPointInRing([pointX, pointY]: Point, ring: LinearRing): boolean {
  let inside = false;

  for (let index = 0, prevIndex = ring.length - 1; index < ring.length; prevIndex = index, index += 1) {
    const [currentX, currentY] = ring[index] ?? [0, 0];
    const [prevX, prevY] = ring[prevIndex] ?? [0, 0];

    const intersects =
      currentY > pointY !== prevY > pointY &&
      pointX < ((prevX - currentX) * (pointY - currentY)) / (prevY - currentY || Number.EPSILON) + currentX;

    if (intersects) inside = !inside;
  }

  return inside;
}

function isPointInPolygon(point: Point, polygon: PolygonCoords): boolean {
  const [outerRing, ...holes] = polygon;
  if (outerRing === undefined || !isPointInRing(point, outerRing)) return false;
  return !holes.some((hole) => isPointInRing(point, hole));
}

function geometryContainsPoint(point: Point, geometry: CountySubdivisionGeometry): boolean {
  if (geometry.type === "Polygon") {
    return isPointInPolygon(point, geometry.coordinates as PolygonCoords);
  }

  return (geometry.coordinates as MultiPolygonCoords).some((polygon) => isPointInPolygon(point, polygon));
}

function buildEmptySummary(county: string, id: string, label: string): CountySubdivisionSummary {
  return {
    id,
    label,
    county,
    communityCount: 0,
    communities: [],
    topBuilders: [],
    activeInventory: 0,
    closedSalesThisMonth: 0,
    totalPlatLots: 0,
    lotsRemaining: 0,
    absorptionRate: null,
    absorptionRatePrevMonth: null,
    medianClosePrice: null,
    medianClosePricePrevMonth: null,
    velocityTier: null,
  };
}

async function fetchCountySubdivisionGeoJson(): Promise<CountySubdivisionGeoJson> {
  const response = await fetch("/data/fl-cousub.geojson");

  if (!response.ok) {
    throw new Error("Unable to load county subdivision boundaries.");
  }

  return response.json() as Promise<CountySubdivisionGeoJson>;
}

export default function useCountySubdivisionSummaries(
  county: string | null,
  homeType: HomeType,
): CountySubdivisionSummariesQuery {
  const { loading: subdivisionsLoading, subdivisions } = useSubdivisionPins(county, homeType);

  const { isLoading: boundariesLoading, data: geoJson } = useQuery<CountySubdivisionGeoJson>(
    ["heatmap", "county-subdivision-boundaries"],
    fetchCountySubdivisionGeoJson,
    { staleTime: STATIC_DATA_STALE_TIME },
  );

  const summaries = useMemo(() => {
    if (county === null) return [];

    const subdivisionDefinitions = COUNTY_SUBDIVISIONS[county] ?? [];
    if (subdivisionDefinitions.length === 0) return [];
    if (boundariesLoading || subdivisionsLoading || geoJson === undefined || subdivisions === undefined) return [];

    const countyFeatures = new Map<string, CountySubdivisionFeature>(
      geoJson.features
        .filter((feature) => feature.properties.countyName === county)
        .map((feature) => [feature.id, feature]),
    );

    const communitiesByBoundary = new Map<string, SubdivisionPin[]>();

    for (const community of subdivisions) {
      const point: Point = [community.lng, community.lat];
      const matchingBoundary = subdivisionDefinitions.find((definition) => {
        const feature = countyFeatures.get(definition.id);
        return feature !== undefined && geometryContainsPoint(point, feature.geometry);
      });

      if (matchingBoundary === undefined) continue;

      const existing = communitiesByBoundary.get(matchingBoundary.id) ?? [];
      existing.push(community);
      communitiesByBoundary.set(matchingBoundary.id, existing);
    }

    return subdivisionDefinitions.map((definition) => {
      const communities = communitiesByBoundary.get(definition.id) ?? [];
      if (communities.length === 0) return buildEmptySummary(county, definition.id, definition.label);

      const absorptionRate = computeAverage(communities.map((community) => community.absorptionRate));
      const absorptionRatePrevMonth = computeAverage(communities.map((community) => community.absorptionRatePrevMonth));
      const medianClosePrice = computeMedian(communities.map((community) => community.medianClosePrice));
      const medianClosePricePrevMonth = computeMedian(
        communities.map((community) => community.medianClosePricePrevMonth),
      );

      const builderWeights = communities.reduce<Map<string, number>>((accumulator, community) => {
        const currentWeight = accumulator.get(community.builder) ?? 0;
        accumulator.set(community.builder, currentWeight + community.activeInventory);
        return accumulator;
      }, new Map<string, number>());

      const topBuilders = [...builderWeights.entries()]
        .sort((entryA, entryB) => entryB[1] - entryA[1])
        .slice(0, 3)
        .map(([builder]) => builder);

      return {
        id: definition.id,
        label: definition.label,
        county,
        communityCount: communities.length,
        communities,
        topBuilders,
        activeInventory: communities.reduce((sum, community) => sum + community.activeInventory, 0),
        closedSalesThisMonth: communities.reduce((sum, community) => sum + community.closedSalesThisMonth, 0),
        totalPlatLots: communities.reduce((sum, community) => sum + community.totalPlatLots, 0),
        lotsRemaining: communities.reduce((sum, community) => sum + community.lotsRemaining, 0),
        absorptionRate,
        absorptionRatePrevMonth,
        medianClosePrice,
        medianClosePricePrevMonth,
        velocityTier: getVelocityTier(absorptionRate),
      };
    });
  }, [boundariesLoading, county, geoJson, subdivisions, subdivisionsLoading]);

  return {
    loading: county !== null && (subdivisionsLoading || boundariesLoading),
    summaries,
  };
}
