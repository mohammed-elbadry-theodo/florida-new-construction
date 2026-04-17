"use client";

import { cn } from "~components/lib/utils";

import type { SubdivisionPin } from "./types";

interface SubdivisionSpotlightCardProps {
  subdivision: SubdivisionPin;
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

const TIER_LABEL: Record<string, string> = { high: "HIGH", medium: "MED", low: "LOW" };
const TIER_COLOR: Record<string, string> = {
  high: "text-emerald-400 bg-emerald-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  low: "text-red-400 bg-red-400/10",
};

export default function SubdivisionSpotlightCard({
  subdivision,
  onClose,
}: SubdivisionSpotlightCardProps): React.ReactElement {
  const velocityMom = subdivision.absorptionRate - subdivision.absorptionRatePrevMonth;
  const priceMom = subdivision.medianClosePrice - subdivision.medianClosePricePrevMonth;
  const lotsUsed = subdivision.totalPlatLots - subdivision.lotsRemaining;
  const buildOutPct = Math.round((lotsUsed / subdivision.totalPlatLots) * 100);

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-gray-900 p-4">
      {/* header */}
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-widest text-gray-500 uppercase">Subdivision</p>
          <h2 className="text-base leading-tight font-bold text-white">{subdivision.name}</h2>
          <p className="mt-0.5 text-[11px] text-gray-500">
            {subdivision.county} County · {subdivision.builder}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest",
              TIER_COLOR[subdivision.velocityTier] ?? "bg-gray-400/10 text-gray-400",
            )}
          >
            {TIER_LABEL[subdivision.velocityTier]}
          </span>
          <button type="button" onClick={onClose} className="text-lg leading-none text-gray-600 hover:text-white">
            ×
          </button>
        </div>
      </div>

      <StatRow
        label="Absorption Rate"
        value={`${subdivision.absorptionRate.toFixed(1)}%`}
        sub={`${velocityMom >= 0 ? "▲" : "▼"} ${Math.abs(velocityMom).toFixed(1)}% vs last month`}
      />
      <StatRow
        label="Median Close Price"
        value={`$${subdivision.medianClosePrice.toLocaleString()}`}
        sub={`${priceMom >= 0 ? "▲" : "▼"} $${Math.abs(priceMom).toLocaleString()} vs last month`}
      />
      <StatRow label="Active Inventory" value={subdivision.activeInventory.toLocaleString()} />
      <StatRow label="Closed This Month" value={subdivision.closedSalesThisMonth.toLocaleString()} />

      {/* lot build-out progress */}
      <div className="mt-1 flex flex-col gap-1 border-b border-white/5 py-2">
        <span className="text-[10px] font-medium tracking-widest text-gray-500 uppercase">Lot Build-Out</span>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white">{subdivision.lotsRemaining.toLocaleString()} remaining</span>
          <span className="text-[11px] text-gray-500">{buildOutPct}% complete</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${Math.min(buildOutPct, 100)}%` }}
          />
        </div>
        <span className="text-[10px] text-gray-600">{subdivision.totalPlatLots.toLocaleString()} total platted lots</span>
      </div>

      <p className="mt-2 text-[10px] text-gray-600 italic">Layer 3 detail view — coming soon</p>
    </div>
  );
}
