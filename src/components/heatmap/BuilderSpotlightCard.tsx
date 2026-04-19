"use client";

import { cn } from "~components/lib/utils";

import type { BuilderSummary } from "~hooks/heatmap/useBuilderPresence";

interface BuilderSpotlightCardProps {
  builder: BuilderSummary;
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

export default function BuilderSpotlightCard({ builder, onClose }: BuilderSpotlightCardProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-gray-900 p-4">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-widest text-gray-500 uppercase">Builder</p>
          <h2 className="text-xl leading-tight font-bold text-white">{builder.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest",
              TIER_COLOR[builder.velocityTier] ?? "bg-gray-400/10 text-gray-400",
            )}
          >
            {TIER_LABEL[builder.velocityTier]}
          </span>
          <button type="button" onClick={onClose} className="text-lg leading-none text-gray-600 hover:text-white">
            ×
          </button>
        </div>
      </div>

      <StatRow label="Active Inventory" value={builder.invUnits.toLocaleString()} />
      <StatRow label="Market Share" value={`${builder.marketSharePct.toFixed(1)}%`} />
      <StatRow label="Active Subdivisions" value={builder.activeSubdivisions.toString()} />
      <StatRow label="Avg Velocity / Mo" value={builder.avgVelocity.toFixed(1)} sub="avg closed sales per month" />

      {builder.communities.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-[10px] font-semibold tracking-widest text-gray-500 uppercase">Communities</p>
          <div className="flex flex-col gap-1">
            {builder.communities.map((c) => (
              <div key={c.id} className="rounded-md border border-white/5 bg-white/[0.03] px-3 py-2">
                <p className="mb-1 truncate text-[11px] font-semibold text-gray-200">{c.name}</p>
                <div className="grid grid-cols-3 gap-x-2 text-[10px] text-gray-500">
                  <span>{c.absorptionRate.toFixed(1)}% vel</span>
                  <span>${(c.medianClosePrice / 1000).toFixed(0)}k</span>
                  <span>{c.activeInventory} inv</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
