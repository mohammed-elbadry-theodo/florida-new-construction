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
