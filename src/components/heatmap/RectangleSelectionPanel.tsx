"use client";

import { useMemo } from "react";

import { cn } from "~components/lib/utils";

import type { RectangleBBox, SubdivisionPin } from "./types";

interface RectangleSelectionPanelProps {
  bbox: RectangleBBox;
  subdivisionPins: SubdivisionPin[];
  onClear: () => void;
}

const TIER_COLOR: Record<string, string> = {
  high:   "text-emerald-400 bg-emerald-400/10",
  medium: "text-amber-400  bg-amber-400/10",
  low:    "text-red-400    bg-red-400/10",
};
const TIER_LABEL: Record<string, string> = { high: "HIGH", medium: "MED", low: "LOW" };

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? (sorted[mid] ?? 0) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }): React.ReactElement {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/5 py-2 last:border-0">
      <span className="text-[10px] font-medium tracking-widest text-gray-500 uppercase">{label}</span>
      <span className="text-base leading-none font-bold text-white">{value}</span>
      {sub !== undefined && <span className="text-[11px] text-gray-500">{sub}</span>}
    </div>
  );
}

export default function RectangleSelectionPanel({
  bbox,
  subdivisionPins,
  onClear,
}: RectangleSelectionPanelProps): React.ReactElement {
  const pinsInBox = useMemo(
    () =>
      subdivisionPins.filter(
        (p) => p.lat >= bbox.south && p.lat <= bbox.north && p.lng >= bbox.west && p.lng <= bbox.east,
      ),
    [subdivisionPins, bbox],
  );

  const stats = useMemo(() => {
    if (pinsInBox.length === 0) return null;
    return {
      avgAbsorption:    avg(pinsInBox.map((p) => p.absorptionRate)),
      medianPrice:      median(pinsInBox.map((p) => p.medianClosePrice)),
      totalInventory:   pinsInBox.reduce((s, p) => s + p.activeInventory, 0),
      totalClosed:      pinsInBox.reduce((s, p) => s + p.closedSalesThisMonth, 0),
      highCount:        pinsInBox.filter((p) => p.velocityTier === "high").length,
      medCount:         pinsInBox.filter((p) => p.velocityTier === "medium").length,
      lowCount:         pinsInBox.filter((p) => p.velocityTier === "low").length,
    };
  }, [pinsInBox]);

  const bridgeFilter =
    `Latitude gt ${bbox.south.toFixed(6)} and Latitude lt ${bbox.north.toFixed(6)}` +
    ` and Longitude gt ${bbox.west.toFixed(6)} and Longitude lt ${bbox.east.toFixed(6)}`;

  return (
    <div className="flex flex-col gap-1">
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-widest text-sky-400/80 uppercase">Area Selection</p>
          <p className="text-sm font-bold text-white">
            {pinsInBox.length} subdivision{pinsInBox.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-sm border border-white/10 px-2 py-1 text-[10px] text-gray-400 transition-colors hover:border-red-400/40 hover:text-red-400"
        >
          Clear
        </button>
      </div>

      {/* Stats */}
      {stats !== null ? (
        <>
          <StatRow
            label="Avg Absorption Rate"
            value={`${stats.avgAbsorption.toFixed(1)}%`}
          />
          <StatRow
            label="Median Close Price"
            value={`$${Math.round(stats.medianPrice).toLocaleString()}`}
          />
          <StatRow
            label="Total Active Inventory"
            value={stats.totalInventory.toLocaleString()}
          />
          <StatRow
            label="Closed This Month"
            value={stats.totalClosed.toLocaleString()}
          />

          {/* Velocity tier breakdown */}
          <div className="flex gap-2 border-b border-white/5 py-2">
            {[
              { tier: "high",   count: stats.highCount },
              { tier: "medium", count: stats.medCount  },
              { tier: "low",    count: stats.lowCount  },
            ].map(({ tier, count }) => (
              <div
                key={tier}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5",
                  TIER_COLOR[tier],
                )}
              >
                <span className="text-base font-bold leading-none">{count}</span>
                <span className="text-[9px] font-semibold tracking-widest uppercase opacity-80">
                  {TIER_LABEL[tier]}
                </span>
              </div>
            ))}
          </div>

          {/* Subdivision list */}
          <div className="flex flex-col gap-px pt-1">
            <p className="mb-1 text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
              Subdivisions in area
            </p>
            {pinsInBox.map((pin) => (
              <div
                key={pin.id}
                className="flex items-center justify-between rounded-md border border-transparent px-2 py-1.5 hover:border-white/10 hover:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-white">{pin.name}</p>
                  <p className="truncate text-[10px] text-gray-500">{pin.builder}</p>
                </div>
                <div className="ml-2 flex shrink-0 flex-col items-end gap-0.5">
                  <span
                    className={cn(
                      "rounded-sm px-1.5 py-0.5 text-[9px] font-bold tracking-widest",
                      TIER_COLOR[pin.velocityTier] ?? "bg-gray-400/10 text-gray-400",
                    )}
                  >
                    {TIER_LABEL[pin.velocityTier]}
                  </span>
                  <span className="text-[10px] tabular-nums text-gray-400">
                    {pin.absorptionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="py-4 text-center text-[11px] text-gray-600">
          No tracked subdivisions found in this area.
        </p>
      )}

      {/* Bridge API filter */}
      <div className="mt-2 rounded-md border border-white/5 bg-white/[0.03] p-2">
        <p className="mb-1 text-[9px] font-semibold tracking-widest text-gray-600 uppercase">Bridge API $filter</p>
        <p className="break-all font-mono text-[9px] leading-relaxed text-sky-400/70">{bridgeFilter}</p>
      </div>
    </div>
  );
}
