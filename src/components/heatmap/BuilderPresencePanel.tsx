"use client";

import { cn } from "~components/lib/utils";

import type { BuilderSummary } from "~hooks/heatmap/useBuilderPresence";

interface BuilderPresencePanelProps {
  builders: BuilderSummary[];
  selectedBuilder: string | null;
  onBuilderClick: (name: string) => void;
}

const TIER_DOT: Record<string, string> = {
  high: "bg-emerald-400",
  medium: "bg-amber-400",
  low: "bg-red-500",
};

export default function BuilderPresencePanel({
  builders,
  selectedBuilder,
  onBuilderClick,
}: BuilderPresencePanelProps): React.ReactElement {
  if (builders.length === 0) {
    return (
      <p className="px-2 pt-2 text-xs text-gray-600">
        Select a county to see builder activity.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-px overflow-y-auto">
      <div className="mb-1 grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-2 px-2 text-[9px] font-semibold tracking-widest text-gray-600 uppercase">
        <span>Builder</span>
        <span className="text-right">Inv</span>
        <span className="text-right">Shr</span>
        <span className="text-right">Subs</span>
        <span className="text-right">Vel</span>
      </div>

      {builders.map((builder) => {
        const isSelected = selectedBuilder === builder.name;

        return (
          <button
            key={builder.name}
            type="button"
            onClick={() => onBuilderClick(builder.name)}
            className={cn(
              "grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-2 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors",
              isSelected ? "border-white/10 bg-white/5" : "hover:bg-white/5",
            )}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className={cn("size-2 shrink-0 rounded-full", TIER_DOT[builder.velocityTier] ?? "bg-gray-500")}
              />
              <span className="truncate text-[11px] text-gray-200">{builder.name}</span>
            </span>
            <span className="text-right text-[11px] font-semibold tabular-nums text-white">
              {builder.invUnits}
            </span>
            <span className="text-right text-[10px] tabular-nums text-gray-400">
              {builder.marketSharePct.toFixed(1)}%
            </span>
            <span className="text-right text-[10px] tabular-nums text-gray-400">
              {builder.activeSubdivisions}
            </span>
            <span className="text-right text-[10px] tabular-nums text-gray-400">
              {builder.avgVelocity.toFixed(1)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
