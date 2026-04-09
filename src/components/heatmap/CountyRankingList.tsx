"use client";

import { cn } from "~components/lib/utils";

import type { CountyMetric, MetricType } from "./types";

interface CountyRankingListProps {
  counties: CountyMetric[];
  activeMetric: MetricType;
  selectedCounty: string | null;
  onCountyClick: (county: string) => void;
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

const TIER_DOT: Record<string, string> = {
  high: "bg-emerald-400",
  medium: "bg-amber-400",
  low: "bg-red-500",
};

export default function CountyRankingList({
  counties,
  activeMetric,
  selectedCounty,
  onCountyClick,
}: CountyRankingListProps): React.ReactElement {
  const sorted = [...counties].sort((itemA, itemB) => {
    const valA = activeMetric === "velocity" ? itemA.absorptionRate : itemA.medianClosePrice;
    const valB = activeMetric === "velocity" ? itemB.absorptionRate : itemB.medianClosePrice;
    return valB - valA;
  });

  return (
    <div className="flex flex-col gap-0.5 overflow-y-auto">
      {sorted.map((item, idx) => {
        const { label: deltaLabel, up } = getMomDeltaLabel(activeMetric, item);
        const isSelected = selectedCounty === item.county;

        return (
          <button
            key={item.county}
            type="button"
            onClick={() => {
              onCountyClick(item.county);
            }}
            className={cn(
              "flex items-center gap-2 rounded-sm px-2 py-1.5 text-left transition-colors",
              isSelected ? "bg-white/10" : "hover:bg-white/5",
            )}
          >
            <span className="w-5 shrink-0 text-right text-[10px] text-gray-600">{idx + 1}</span>
            <span className={cn("size-2  shrink-0 rounded-full", TIER_DOT[item.velocityTier] ?? "bg-gray-500")} />
            <span className="flex-1 truncate text-xs text-gray-200">{item.county}</span>
            <span className="text-xs font-semibold text-white tabular-nums">{getMetricLabel(activeMetric, item)}</span>
            <span className={cn("text-[10px] tabular-nums", up ? "text-emerald-400" : "text-red-400")}>
              {up ? "▲" : "▼"} {deltaLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
