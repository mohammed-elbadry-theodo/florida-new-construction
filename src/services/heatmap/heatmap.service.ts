import type { HeatmapApiParams, HeatmapApiResponse, SubdivisionsApiParams, SubdivisionsApiResponse } from "~components/heatmap/types";
import internalClient from "~utils/axiosInternalClient";

const getCountyMetrics = async ({ metric, homeType }: HeatmapApiParams): Promise<HeatmapApiResponse> => {
  return internalClient.get<HeatmapApiResponse>("/api/heatmap/counties", {
    params: { metric, homeType },
  });
};

const getSubdivisionPins = async ({ county, homeType }: SubdivisionsApiParams): Promise<SubdivisionsApiResponse> => {
  return internalClient.get<SubdivisionsApiResponse>("/api/heatmap/subdivisions", {
    params: { county, homeType },
  });
};

const heatmapService = { getCountyMetrics, getSubdivisionPins };
export default heatmapService;
