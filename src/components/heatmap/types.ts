export type MetricType = "median_price" | "velocity";
export type HomeType = "sfh" | "townhome";
export type VelocityTier = "high" | "low" | "medium";

export interface CountyMetric {
  county: string;
  absorptionRate: number;
  absorptionRatePrevMonth: number;
  medianClosePrice: number;
  medianClosePricePrevMonth: number;
  activeInventory: number;
  closedSalesThisMonth: number;
  velocityTier: VelocityTier;
}

export interface HeatmapApiParams {
  metric: MetricType;
  homeType: HomeType;
}

export interface HeatmapApiResponse {
  counties: CountyMetric[];
  month: string; // ISO date of the month queried, e.g. "2026-03-01"
}

// ─── Layer 2 — subdivision pins ───────────────────────────────────────────────

export interface SubdivisionPin {
  id: string;               // unique slug used as GeoJSON feature id
  name: string;             // "Laureate Park"
  county: string;           // "Orange"
  builder: string;          // "Tavistock Development"
  lng: number;
  lat: number;
  homeType: HomeType;
  absorptionRate: number;
  absorptionRatePrevMonth: number;
  medianClosePrice: number;
  medianClosePricePrevMonth: number;
  activeInventory: number;
  closedSalesThisMonth: number;
  velocityTier: VelocityTier;
  totalPlatLots: number;
  lotsRemaining: number;
}

export interface SubdivisionsApiParams {
  county: string;
  homeType: HomeType;
}

export interface SubdivisionsApiResponse {
  subdivisions: SubdivisionPin[];
  county: string;
  month: string;
}
