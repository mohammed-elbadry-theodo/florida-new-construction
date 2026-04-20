"use client";

import { cn } from "~components/lib/utils";

import { COUNTY_SUBDIVISIONS } from "./county-subdivisions.data";
import type { CountyMetric, MetricType } from "./types";

interface CountyRankingListProps {
  counties: CountyMetric[];
  activeMetric: MetricType;
  selectedCounty: string | null;
  selectedSubdivisionId: string | null;
  onCountyClick: (county: string) => void;
  onCountyHover: (county: string | null) => void;
  onSubdivisionHover: (subdivisionId: string | null) => void;
  onSubdivisionSelect: (subdivisionId: string) => void;
}

function getMomDeltaLabel(metric: MetricType, data: CountyMetric): { label: string; up: boolean } {
  if (metric === "velocity") {
    const velocityDelta = data.absorptionRate - data.absorptionRatePrevMonth;
    return { label: `${Math.abs(velocityDelta).toFixed(1)}%`, up: velocityDelta >= 0 };
  }

  const priceDelta = data.medianClosePrice - data.medianClosePricePrevMonth;
  return { label: `$${Math.abs(Math.round(priceDelta / 1000)).toFixed(0)}k`, up: priceDelta >= 0 };
}

function getMetricLabel(metric: MetricType, data: CountyMetric): string {
  if (metric === "velocity") return `${data.absorptionRate.toFixed(1)}%`;
  return `$${(data.medianClosePrice / 1000).toFixed(0)}k`;
}

function getSubdivisionPanelId(county: string): string {
  return `county-subdivisions-${county.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

const TIER_DOT: Record<string, string> = {
  high: "bg-emerald-400",
  medium: "bg-amber-400",
  low: "bg-red-500",
};

export default function CountyRankingList({
  counties,
  activeMetric,
  selectedCounty,
  selectedSubdivisionId,
  onCountyClick,
  onCountyHover,
  onSubdivisionHover,
  onSubdivisionSelect,
}: CountyRankingListProps): React.ReactElement {
  const sorted = [...counties].sort((itemA, itemB) => {
    const valA = activeMetric === "velocity" ? itemA.absorptionRate : itemA.medianClosePrice;
    const valB = activeMetric === "velocity" ? itemB.absorptionRate : itemB.medianClosePrice;
    return valB - valA;
  });

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {sorted.map((item, idx) => {
        const { label: deltaLabel, up } = getMomDeltaLabel(activeMetric, item);
        const isSelected = selectedCounty === item.county;
        const subdivisions = COUNTY_SUBDIVISIONS[item.county] ?? [];
        const subdivisionPanelId = getSubdivisionPanelId(item.county);

        return (
          <div
            key={item.county}
            className={cn(
              "rounded-md border border-transparent transition-colors",
              isSelected ? "border-white/10 bg-white/5" : "hover:bg-white/5",
            )}
          >
            <button
              type="button"
              aria-controls={subdivisionPanelId}
              aria-expanded={isSelected}
              onClick={() => { onCountyClick(item.county); }}
              onMouseEnter={() => { onCountyHover(item.county); }}
              onMouseLeave={() => { onCountyHover(null); }}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-left"
            >
              <span className="w-5 shrink-0 text-right text-[10px] text-gray-600">{idx + 1}</span>
              <span className={cn("size-2 shrink-0 rounded-full", TIER_DOT[item.velocityTier] ?? "bg-gray-500")} />
              <span className="flex-1 truncate text-xs text-gray-200">{item.county}</span>
              <span className="text-xs font-semibold text-white tabular-nums">
                {getMetricLabel(activeMetric, item)}
              </span>
              <span className={cn("text-[10px] tabular-nums", up ? "text-emerald-400" : "text-red-400")}>
                {up ? "+" : "-"}
                {deltaLabel}
              </span>
            </button>

            {isSelected && subdivisions.length > 0 && (
              <div
                id={subdivisionPanelId}
                className="pb-2 pl-9 pr-2"
                onMouseLeave={() => {
                  onSubdivisionHover(null);
                }}
              >
                <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className="mb-2 text-[10px] font-semibold text-gray-500">County subdivisions</p>
                  <ul className="space-y-1.5">
                    {subdivisions.map((subdivision) => {
                      const isSubdivisionSelected = selectedSubdivisionId === subdivision.id;

                      return (
                        <li key={subdivision.id}>
                          <button
                            type="button"
                            aria-pressed={isSubdivisionSelected}
                            className={cn(
                              "flex w-full items-start gap-2 rounded-sm px-1 py-1 text-left transition-colors",
                              isSubdivisionSelected ? "bg-sky-300/14" : "hover:bg-sky-300/10",
                            )}
                            onClick={() => {
                              onSubdivisionSelect(subdivision.id);
                            }}
                            onMouseEnter={() => {
                              onSubdivisionHover(subdivision.id);
                            }}
                          >
                            <span className="mt-2 h-px w-2 shrink-0 bg-sky-300/70" aria-hidden="true" />
                            <span
                              className={cn(
                                "text-[11px] leading-4",
                                isSubdivisionSelected ? "text-white" : "text-gray-300",
                              )}
                            >
                              {subdivision.label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
