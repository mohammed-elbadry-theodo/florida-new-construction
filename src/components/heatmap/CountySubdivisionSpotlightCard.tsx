"use client";

import { cn } from "~components/lib/utils";
import type { CountySubdivisionSummary } from "~hooks/heatmap/useCountySubdivisionSummaries";

function StatRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string | undefined;
}): React.ReactElement {
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

interface CountySubdivisionSpotlightCardProps {
  subdivision: CountySubdivisionSummary;
  onClose: () => void;
}

export default function CountySubdivisionSpotlightCard({
  subdivision,
  onClose,
}: CountySubdivisionSpotlightCardProps): React.ReactElement {
  const velocityMom =
    subdivision.absorptionRate !== null && subdivision.absorptionRatePrevMonth !== null
      ? subdivision.absorptionRate - subdivision.absorptionRatePrevMonth
      : null;
  const priceMom =
    subdivision.medianClosePrice !== null && subdivision.medianClosePricePrevMonth !== null
      ? subdivision.medianClosePrice - subdivision.medianClosePricePrevMonth
      : null;
  const lotsUsed = subdivision.totalPlatLots - subdivision.lotsRemaining;
  const buildOutPct = subdivision.totalPlatLots > 0 ? Math.round((lotsUsed / subdivision.totalPlatLots) * 100) : 0;

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-gray-900 p-4">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-widest text-gray-500 uppercase">Selected Subdivision</p>
          <h2 className="text-base leading-tight font-bold text-white">{subdivision.label}</h2>
          <p className="mt-0.5 text-[11px] text-gray-500">
            {subdivision.county} County - {subdivision.communityCount} modeled{" "}
            {subdivision.communityCount === 1 ? "community" : "communities"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {subdivision.velocityTier !== null && (
            <span
              className={cn(
                "rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest",
                TIER_COLOR[subdivision.velocityTier] ?? "bg-gray-400/10 text-gray-400",
              )}
            >
              {TIER_LABEL[subdivision.velocityTier]}
            </span>
          )}
          <button type="button" onClick={onClose} className="text-lg leading-none text-gray-600 hover:text-white">
            x
          </button>
        </div>
      </div>

      {subdivision.communityCount > 0 ? (
        <>
          <StatRow
            label="Absorption Rate"
            value={`${(subdivision.absorptionRate ?? 0).toFixed(1)}%`}
            sub={
              velocityMom !== null
                ? `${velocityMom >= 0 ? "+" : "-"}${Math.abs(velocityMom).toFixed(1)}% vs last month`
                : undefined
            }
          />
          <StatRow
            label="Median Close Price"
            value={`$${Math.round(subdivision.medianClosePrice ?? 0).toLocaleString()}`}
            sub={
              priceMom !== null
                ? `${priceMom >= 0 ? "+" : "-"}$${Math.abs(Math.round(priceMom)).toLocaleString()} vs last month`
                : undefined
            }
          />
          <StatRow label="Active Inventory" value={subdivision.activeInventory.toLocaleString()} />
          <StatRow label="Closed This Month" value={subdivision.closedSalesThisMonth.toLocaleString()} />

          <div className="mt-1 flex flex-col gap-1 border-b border-white/5 py-2">
            <span className="text-[10px] font-medium tracking-widest text-gray-500 uppercase">Lot Build-Out</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">
                {subdivision.lotsRemaining.toLocaleString()} remaining
              </span>
              <span className="text-[11px] text-gray-500">{buildOutPct}% complete</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-sky-400" style={{ width: `${Math.min(buildOutPct, 100)}%` }} />
            </div>
            <span className="text-[10px] text-gray-600">
              {subdivision.totalPlatLots.toLocaleString()} total lots across modeled communities
            </span>
          </div>

          {subdivision.topBuilders.length > 0 && (
            <div className="border-b border-white/5 py-2">
              <p className="text-[10px] font-medium tracking-widest text-gray-500 uppercase">Top Builders</p>
              <p className="mt-1 text-[11px] text-gray-300">{subdivision.topBuilders.join(" | ")}</p>
            </div>
          )}

          <div className="pt-2">
            <p className="mb-2 text-[10px] font-medium tracking-widest text-gray-500 uppercase">Modeled Communities</p>
            <div className="space-y-1.5">
              {subdivision.communities.map((community) => (
                <div key={community.id} className="rounded-md border border-white/5 bg-white/[0.03] px-3 py-2">
                  <p className="text-xs font-semibold text-white">{community.name}</p>
                  <p className="text-[11px] text-gray-500">{community.builder}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm text-gray-300">
          No modeled community metrics are mapped to this county subdivision yet. The boundary selection is still locked
          on the map, and you can pick another subdivision or clear this one.
        </div>
      )}
    </div>
  );
}
