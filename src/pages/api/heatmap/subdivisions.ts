/**
 * GET /api/heatmap/subdivisions
 *
 * Returns Layer 2 subdivision pins for a single county.
 *
 * Query params:
 *   county   — county name, e.g. "Orange"
 *   homeType — "sfh" | "townhome"
 *
 * TODO: replace mock with real Bridge RESO Web API queries when credentials
 *       are available. Filter by CountyOrParish + SubdivisionName grouping.
 */

import type { HomeType, SubdivisionsApiResponse } from "~components/heatmap/types";
import { getMockSubdivisionPins } from "~services/heatmap/mock-subdivisions.data";

import type { NextApiRequest, NextApiResponse } from "next";

const ALLOWED_HOME_TYPES: HomeType[] = ["sfh", "townhome"];

export default function handler(req: NextApiRequest, res: NextApiResponse<SubdivisionsApiResponse>): void {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const rawCounty = req.query["county"];
  const rawHomeType = req.query["homeType"];

  if (typeof rawCounty !== "string" || rawCounty.trim() === "") {
    res.status(400).json({ subdivisions: [], county: "", month: "" });
    return;
  }

  const homeType: HomeType =
    typeof rawHomeType === "string" && (ALLOWED_HOME_TYPES as string[]).includes(rawHomeType)
      ? (rawHomeType as HomeType)
      : "sfh";

  const now = new Date();
  const month = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().slice(0, 10);

  const subdivisions = getMockSubdivisionPins(rawCounty, homeType);

  res.status(200).json({ subdivisions, county: rawCounty, month });
}
