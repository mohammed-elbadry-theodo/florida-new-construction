"use client";

import { useEffect, useMemo, useState } from "react";

import { useCountyMetrics, useCountySubdivisionSummaries } from "~hooks/heatmap";
import useBuilderPresence from "~hooks/heatmap/useBuilderPresence";
import useSubdivisionPins from "~hooks/heatmap/useSubdivisionPins";
import {
  clearBuilderFilters,
  selectFilterBuilder,
  selectHomeType,
  selectMetric,
  selectSelectedBuilder,
  selectSelectedCounty,
  selectSelectedSubdivision,
  selectSortBy,
  setFilterBuilder,
  setHomeType,
  setMetric,
  setSelectedBuilder,
  setSelectedCounty,
  setSelectedSubdivision,
  setSortBy,
} from "~store/heatmap/slice";
import { useAppDispatch, useAppSelector } from "~store/hooks";

import { COUNTY_SUBDIVISIONS } from "./county-subdivisions.data";
import BuilderPresencePanel from "./BuilderPresencePanel";
import BuilderSpotlightCard from "./BuilderSpotlightCard";
import CountyRankingList from "./CountyRankingList";
import CountySpotlightCard from "./CountySpotlightCard";
import CountySubdivisionSpotlightCard from "./CountySubdivisionSpotlightCard";
import FilterSortBar from "./FilterSortBar";
import HomeTypeToggle from "./HomeTypeToggle";
import MetricToggle from "./MetricToggle";

import { cn } from "~components/lib/utils";

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
  const selectedBuilder = useAppSelector(selectSelectedBuilder);
  const sortBy = useAppSelector(selectSortBy);
  const filterBuilder = useAppSelector(selectFilterBuilder);

  const [hoveredSubdivisionId, setHoveredSubdivisionId] = useState<string | null>(null);
  const [subdivisionSearch, setSubdivisionSearch] = useState("");
  const [rightTab, setRightTab] = useState<"summary" | "builders">("summary");

  const { counties, loading, month } = useCountyMetrics(metric, homeType);
  const { loading: subdivisionSummariesLoading, summaries: subdivisionSummaries } = useCountySubdivisionSummaries(
    selectedCounty,
    homeType,
  );
  const { subdivisions: subdivisionPins } = useSubdivisionPins(selectedCounty, homeType);

  const builderSummaries = useBuilderPresence(subdivisionPins, sortBy);

  const filteredBuilders = useMemo(() => {
    if (filterBuilder === null) return builderSummaries;
    return builderSummaries.filter((b) => b.name === filterBuilder);
  }, [builderSummaries, filterBuilder]);

  const builderOptions = useMemo(
    () => [...new Set(builderSummaries.map((b) => b.name))].sort(),
    [builderSummaries],
  );

  const activeBuilderSummary = useMemo(
    () => (selectedBuilder !== null ? builderSummaries.find((b) => b.name === selectedBuilder) ?? null : null),
    [builderSummaries, selectedBuilder],
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
    setRightTab("summary");
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

  const handleBuilderClick = (name: string) => {
    dispatch(setSelectedBuilder(selectedBuilder === name ? null : name));
  };

  const handleClearFilters = () => {
    setSubdivisionSearch("");
    dispatch(clearBuilderFilters());
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

      <FilterSortBar
        sortBy={sortBy}
        filterBuilder={filterBuilder}
        subdivisionSearch={subdivisionSearch}
        builderOptions={builderOptions}
        onSortChange={(v) => dispatch(setSortBy(v))}
        onFilterBuilderChange={(v) => dispatch(setFilterBuilder(v))}
        onSubdivisionSearchChange={setSubdivisionSearch}
        onClearFilters={handleClearFilters}
      />

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

        <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-l border-white/10">
          {/* Tab bar — only shown when a county is selected */}
          {selectedCounty !== null && (
            <div className="flex shrink-0 overflow-hidden border-b border-white/10">
              {(["summary", "builders"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRightTab(tab)}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-semibold tracking-widest uppercase transition-colors",
                    rightTab === tab ? "bg-white/10 text-white" : "bg-gray-900 text-gray-400 hover:text-white",
                  )}
                >
                  {tab === "summary" ? "Summary" : "Builders"}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3">
            {rightTab === "builders" && selectedCounty !== null ? (
              <>
                {selectedBuilder !== null && activeBuilderSummary !== null ? (
                  <BuilderSpotlightCard
                    builder={activeBuilderSummary}
                    onClose={() => dispatch(setSelectedBuilder(null))}
                  />
                ) : (
                  <BuilderPresencePanel
                    builders={filteredBuilders}
                    selectedBuilder={selectedBuilder}
                    onBuilderClick={handleBuilderClick}
                  />
                )}
              </>
            ) : selectedSubdivision !== null ? (
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
          </div>
        </aside>
      </div>
    </div>
  );
}
