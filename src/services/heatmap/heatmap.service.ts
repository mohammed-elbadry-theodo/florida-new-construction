import type { HeatmapApiParams, HeatmapApiResponse } from "~components/heatmap/types";
import internalClient from "~utils/axiosInternalClient";

const getCountyMetrics = async ({ metric, homeType }: HeatmapApiParams): Promise<HeatmapApiResponse> => {
  return internalClient.get<HeatmapApiResponse>("/api/heatmap/counties", {
    params: { metric, homeType },
  });
};

const heatmapService = { getCountyMetrics };
export default heatmapService;
