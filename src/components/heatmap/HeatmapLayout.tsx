"use client";

import { useCountyMetrics } from "~hooks/heatmap";
import {
  selectHomeType,
  selectMetric,
  selectSelectedCounty,
  setHomeType,
  setMetric,
  setSelectedCounty,
} from "~store/heatmap/slice";
import { useAppDispatch, useAppSelector } from "~store/hooks";

import CountyRankingList from "./CountyRankingList";
import CountySpotlightCard from "./CountySpotlightCard";
import HomeTypeToggle from "./HomeTypeToggle";
import MetricToggle from "./MetricToggle";

import dynamic from "next/dynamic";

const HeatmapMap = dynamic(async () => import("./HeatmapMap"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center text-sm text-gray-600">Loading map…</div>
  ),
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

  const { counties, loading, month } = useCountyMetrics(metric, homeType);

  const countySpotlight =
    selectedCounty !== null && counties !== undefined
      ? (counties.find((e) => e.county === selectedCounty) ?? null)
      : null;

  const monthLabel = formatMonthLabel(month);

  const handleCountyClick = (county: string) =>
    dispatch(setSelectedCounty(selectedCounty === county ? null : county));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-950 text-white">
      {/* top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-3">
        <div>
          <h1 className="text-base font-bold tracking-tight">Florida New Construction — Sales Activity</h1>
          {monthLabel !== "" && <p className="text-[11px] text-gray-500">{monthLabel}</p>}
        </div>
        <div className="flex items-center gap-3">
          <MetricToggle value={metric} onChange={(val) => dispatch(setMetric(val))} />
          <HomeTypeToggle value={homeType} onChange={(val) => dispatch(setHomeType(val))} />
        </div>
      </header>

      {/* body */}
      <div className="flex flex-1 overflow-hidden">
        {/* left — county ranking list */}
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-white/10 px-2 py-3">
          <p className="mb-2 px-2 text-[10px] font-semibold tracking-widest text-gray-500 uppercase">Counties</p>
          {loading || counties === undefined ? (
            <p className="px-2 text-xs text-gray-600">Loading…</p>
          ) : (
            <CountyRankingList
              counties={counties}
              activeMetric={metric}
              selectedCounty={selectedCounty}
              onCountyClick={handleCountyClick}
            />
          )}
        </aside>

        {/* center — map */}
        <main className="relative flex-1 overflow-hidden">
          {counties !== undefined && (
            <HeatmapMap
              counties={counties}
              activeMetric={metric}
              selectedCounty={selectedCounty}
              onCountyClick={handleCountyClick}
            />
          )}
        </main>

        {/* right — spotlight panel */}
        <aside className="w-64 shrink-0 overflow-y-auto border-l border-white/10 p-3">
          {countySpotlight !== null ? (
            <CountySpotlightCard
              county={countySpotlight}
              onClose={() => dispatch(setSelectedCounty(null))}
            />
          ) : (
            <p className="px-1 pt-2 text-[11px] text-gray-600">Click a county to see details</p>
          )}
        </aside>
      </div>
    </div>
  );
}
