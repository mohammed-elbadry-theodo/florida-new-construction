import type { CountyMetric, HomeType, MetricType } from "~components/heatmap/types";
import type BaseError from "~errors/BaseError";
import { heatmapService } from "~services/heatmap";

import { countyMetricsQueryKey } from "./keys";

import { useQuery } from "react-query";

const FIVE_MINUTES = 5 * 60 * 1000;

interface ICountyMetricsQuery {
  loading: boolean;
  error: BaseError | null;
  counties: CountyMetric[] | undefined;
  month: string | undefined;
}

function useCountyMetrics(metric: MetricType, homeType: HomeType): ICountyMetricsQuery {
  const {
    isLoading: loading,
    data,
    error,
  } = useQuery<Awaited<ReturnType<typeof heatmapService.getCountyMetrics>>, BaseError>(
    countyMetricsQueryKey(metric, homeType),
    async () => heatmapService.getCountyMetrics({ metric, homeType }),
    { staleTime: FIVE_MINUTES },
  );

  return {
    loading,
    error,
    counties: data?.counties,
    month: data?.month,
  };
}

export default useCountyMetrics;
