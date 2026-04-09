"use client";

import { cn } from "~components/lib/utils";

import type { MetricType } from "./types";

interface MetricToggleProps {
  value: MetricType;
  onChange: (v: MetricType) => void;
}

const OPTIONS: Array<{ label: string; value: MetricType }> = [
  { label: "VELOCITY", value: "velocity" },
  { label: "MEDIAN PRICE", value: "median_price" },
];

export default function MetricToggle({ value, onChange }: MetricToggleProps): React.ReactElement {
  return (
    <div className="flex overflow-hidden rounded-sm border border-white/10">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => {
            onChange(opt.value);
          }}
          className={cn(
            "px-4 py-1.5 text-xs font-semibold tracking-widest transition-colors",
            value === opt.value ? "bg-emerald-500 text-black" : "bg-gray-900 text-gray-400 hover:text-white",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
