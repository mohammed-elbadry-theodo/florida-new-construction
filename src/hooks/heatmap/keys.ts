import type { HomeType, MetricType } from "~components/heatmap/types";

const HEATMAP = "heatmap";

export const countyMetricsQueryKey = (metric: MetricType, homeType: HomeType): string[] => {
  return [HEATMAP, "counties", metric, homeType];
};

export const subdivisionPinsQueryKey = (county: string, homeType: HomeType): string[] => {
  return [HEATMAP, "subdivisions", county, homeType];
};
