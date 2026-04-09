"use client";

import { cn } from "~components/lib/utils";

import type { HomeType } from "./types";

interface HomeTypeToggleProps {
  value: HomeType;
  onChange: (v: HomeType) => void;
}

export default function HomeTypeToggle({ value, onChange }: HomeTypeToggleProps): React.ReactElement {
  return (
    <div className="flex overflow-hidden rounded-sm border border-white/10">
      {(["sfh", "townhome"] as HomeType[]).map((ht) => (
        <button
          key={ht}
          type="button"
          onClick={() => {
            onChange(ht);
          }}
          className={cn(
            "px-4 py-1.5 text-xs font-semibold tracking-widest transition-colors",
            value === ht ? "bg-white/10 text-white" : "bg-gray-900 text-gray-400 hover:text-white",
          )}
        >
          {ht === "sfh" ? "SFH" : "TOWNHOME"}
        </button>
      ))}
    </div>
  );
}
