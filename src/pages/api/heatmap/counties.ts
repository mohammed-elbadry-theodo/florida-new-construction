import type { HeatmapApiResponse, HomeType, MetricType } from "~components/heatmap/types";
import { getCountyMetrics } from "~services/heatmap/bridge-heatmap.service";
import { getMockCountyMetrics } from "~services/heatmap/mock-heatmap.data";

import type { NextApiRequest, NextApiResponse } from "next";

const USE_MOCK = (process.env["BRIDGE_SERVER_TOKEN"] ?? "") === "";

function getMonthRange(date: Date): { start: string; end: string } {
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
  const end = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59));
  return { start: start.toISOString(), end: end.toISOString() };
}

const ALLOWED_METRICS: MetricType[] = ["velocity", "median_price"];
const ALLOWED_HOME_TYPES: HomeType[] = ["sfh", "townhome"];

export default async function handler(req: NextApiRequest, res: NextApiResponse<HeatmapApiResponse>): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const rawHomeType = req.query["homeType"];
  const rawMetric = req.query["metric"];

  const homeType: HomeType =
    typeof rawHomeType === "string" && (ALLOWED_HOME_TYPES as string[]).includes(rawHomeType)
      ? (rawHomeType as HomeType)
      : "sfh";

  const metric: MetricType =
    typeof rawMetric === "string" && (ALLOWED_METRICS as string[]).includes(rawMetric)
      ? (rawMetric as MetricType)
      : "velocity";

  const now = new Date();
  const current = getMonthRange(now);
  const prevDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
  const prev = getMonthRange(prevDate);

  try {
    const counties = USE_MOCK
      ? getMockCountyMetrics(homeType)
      : await getCountyMetrics(homeType, {
          currentMonthStart: current.start,
          currentMonthEnd: current.end,
          prevMonthStart: prev.start,
          prevMonthEnd: prev.end,
        });

    res.status(200).json({
      counties,
      month: current.start.slice(0, 10),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api/heatmap/counties]", metric, homeType, err);
    res.status(500).json({ counties: [], month: current.start.slice(0, 10) });
  }
}
