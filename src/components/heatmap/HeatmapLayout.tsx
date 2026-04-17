"use client";

import { useEffect, useState } from "react";

import { useCountyMetrics, useCountySubdivisionSummaries } from "~hooks/heatmap";
import {
  selectHomeType,
  selectMetric,
  selectSelectedCounty,
  selectSelectedSubdivision,
  setHomeType,
  setMetric,
  setSelectedCounty,
  setSelectedSubdivision,
} from "~store/heatmap/slice";
import { useAppDispatch, useAppSelector } from "~store/hooks";

import { COUNTY_SUBDIVISIONS } from "./county-subdivisions.data";
import CountyRankingList from "./CountyRankingList";
import CountySpotlightCard from "./CountySpotlightCard";
import CountySubdivisionSpotlightCard from "./CountySubdivisionSpotlightCard";
import HomeTypeToggle from "./HomeTypeToggle";
import MetricToggle from "./MetricToggle";

import dynamic from "next/dynamic";

const HeatmapMap = dynamic(async () => import("./HeatmapMap"), {
  ssr: false,
  loading: () => <div className="flex size-full items-center justify-center text-sm text-gray-600">Loading map...</div>,
});

function formatMonthLabel(month: string | null | undefined): string {
  if (month === undefined || month === null || month === "") return "";
  return new Date(month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function HeatmapLayout(): React.ReactElement {
  const dispatch = useAppDispatch();
  const metric = useAppSelector(selectMetric);
  const homeType = useAppSelector(selectHomeType);
  const selectedCounty = useAppSelector(selectSelectedCounty);
  const selectedSubdivision = useAppSelector(selectSelectedSubdivision);
  const [hoveredSubdivisionId, setHoveredSubdivisionId] = useState<string | null>(null);

  const { counties, loading, month } = useCountyMetrics(metric, homeType);
  const { loading: subdivisionSummariesLoading, summaries: subdivisionSummaries } = useCountySubdivisionSummaries(
    selectedCounty,
    homeType,
  );

  const countySpotlight =
    selectedCounty !== null && counties !== undefined
      ? counties.find((entry) => entry.county === selectedCounty) ?? null
      : null;

  const selectedSubdivisionSummary =
    selectedSubdivision !== null
      ? subdivisionSummaries.find((summary) => summary.id === selectedSubdivision) ?? null
      : null;

  const selectedSubdivisionLabel =
    selectedCounty !== null && selectedSubdivision !== null
      ? COUNTY_SUBDIVISIONS[selectedCounty]?.find((subdivision) => subdivision.id === selectedSubdivision)?.label ??
        null
      : null;

  const breadcrumb =
    selectedCounty === null
      ? "Florida"
      : selectedSubdivisionLabel !== null
      ? `Florida > ${selectedCounty} County > ${selectedSubdivisionLabel}`
      : `Florida > ${selectedCounty} County`;

  const monthLabel = formatMonthLabel(month);

  useEffect(() => {
    setHoveredSubdivisionId(null);
  }, [selectedCounty]);

  const handleCountyClick = (county: string) => {
    setHoveredSubdivisionId(null);
    dispatch(setSelectedCounty(selectedCounty === county ? null : county));
  };

  const handleSubdivisionSelect = (subdivisionId: string) => {
    dispatch(setSelectedSubdivision(subdivisionId));
  };

  const clearSelectedSubdivision = () => {
    setHoveredSubdivisionId(null);
    dispatch(setSelectedSubdivision(null));
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-950 text-white">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-3">
        <div>
          <p className="mb-1 text-[10px] font-semibold text-sky-200/80">{breadcrumb}</p>
          <h1 className="text-base font-bold tracking-tight">Florida New Construction - Sales Activity</h1>
          <div className="mt-1 flex items-center gap-3">
            {monthLabel !== "" && <p className="text-[11px] text-gray-500">{monthLabel}</p>}
            {selectedSubdivision !== null && (
              <button
                type="button"
                onClick={clearSelectedSubdivision}
                className="rounded-sm border border-white/10 px-2 py-0.5 text-[10px] text-gray-300 hover:border-sky-200/40 hover:text-white"
              >
                Clear subdivision
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MetricToggle value={metric} onChange={(value) => dispatch(setMetric(value))} />
          <HomeTypeToggle value={homeType} onChange={(value) => dispatch(setHomeType(value))} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-white/10 px-2 py-3">
          <p className="mb-2 px-2 text-xs font-semibold text-gray-500">Counties</p>
          {loading || counties === undefined ? (
            <p className="px-2 text-xs text-gray-600">Loading...</p>
          ) : (
            <CountyRankingList
              counties={counties}
              activeMetric={metric}
              selectedCounty={selectedCounty}
              selectedSubdivisionId={selectedSubdivision}
              onCountyClick={handleCountyClick}
              onSubdivisionHover={setHoveredSubdivisionId}
              onSubdivisionSelect={handleSubdivisionSelect}
            />
          )}
        </aside>

        <main className="relative flex-1 overflow-hidden">
          {counties !== undefined && (
            <HeatmapMap
              counties={counties}
              activeMetric={metric}
              selectedCounty={selectedCounty}
              hoveredSubdivisionId={hoveredSubdivisionId}
              selectedSubdivisionId={selectedSubdivision}
              onCountyClick={handleCountyClick}
              onSubdivisionSelect={handleSubdivisionSelect}
            />
          )}
        </main>

        <aside className="w-72 shrink-0 overflow-y-auto border-l border-white/10 p-3">
          {selectedSubdivision !== null ? (
            subdivisionSummariesLoading && selectedSubdivisionSummary === null ? (
              <p className="px-1 pt-2 text-[11px] text-gray-600">Loading subdivision details...</p>
            ) : selectedSubdivisionSummary !== null ? (
              <CountySubdivisionSpotlightCard
                subdivision={selectedSubdivisionSummary}
                onClose={clearSelectedSubdivision}
              />
            ) : (
              <p className="px-1 pt-2 text-[11px] text-gray-600">Subdivision details are not available yet.</p>
            )
          ) : countySpotlight !== null ? (
            <CountySpotlightCard county={countySpotlight} onClose={() => dispatch(setSelectedCounty(null))} />
          ) : (
            <p className="px-1 pt-2 text-[11px] text-gray-600">Click a county to see details</p>
          )}
        </aside>
      </div>
    </div>
  );
}
