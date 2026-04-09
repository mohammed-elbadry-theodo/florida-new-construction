"use client";

import { cn } from "~components/lib/utils";

import type { CountyMetric, MetricType } from "./types";

interface CountySpotlightCardProps {
  county: CountyMetric;
  activeMetric?: MetricType;
  onClose: () => void;
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }): React.ReactElement {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/5 py-2 last:border-0">
      <span className="text-[10px] font-medium tracking-widest text-gray-500 uppercase">{label}</span>
      <span className="text-lg leading-none font-bold text-white">{value}</span>
      {sub !== undefined && sub !== "" && <span className="text-[11px] text-gray-500">{sub}</span>}
    </div>
  );
}

const TIER_LABEL: Record<string, string> = {
  high: "HIGH",
  medium: "MED",
  low: "LOW",
};
const TIER_COLOR: Record<string, string> = {
  high: "text-emerald-400 bg-emerald-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  low: "text-red-400 bg-red-400/10",
};

export default function CountySpotlightCard({ county, onClose }: CountySpotlightCardProps): React.ReactElement {
  const velocityMom = county.absorptionRate - county.absorptionRatePrevMonth;
  const priceMom = county.medianClosePrice - county.medianClosePricePrevMonth;

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-gray-900 p-4">
      {/* header */}
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-widest text-gray-500 uppercase">Selected County</p>
          <h2 className="text-xl leading-tight font-bold text-white">{county.county}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest",
              TIER_COLOR[county.velocityTier] ?? "bg-gray-400/10 text-gray-400",
            )}
          >
            {TIER_LABEL[county.velocityTier]}
          </span>
          <button type="button" onClick={onClose} className="text-lg leading-none text-gray-600 hover:text-white">
            ×
          </button>
        </div>
      </div>

      <StatRow
        label="Absorption Rate"
        value={`${county.absorptionRate.toFixed(1)}%`}
        sub={`${velocityMom >= 0 ? "▲" : "▼"} ${Math.abs(velocityMom).toFixed(1)}% vs last month`}
      />
      <StatRow
        label="Median Close Price"
        value={`$${county.medianClosePrice.toLocaleString()}`}
        sub={`${priceMom >= 0 ? "▲" : "▼"} $${Math.abs(priceMom).toLocaleString()} vs last month`}
      />
      <StatRow label="Active Inventory" value={county.activeInventory.toLocaleString()} />
      <StatRow label="Closed Sales This Month" value={county.closedSalesThisMonth.toLocaleString()} />

      <p className="mt-2 text-[10px] text-gray-600 italic">Click county on map to drill into Layer 2</p>
    </div>
  );
}
