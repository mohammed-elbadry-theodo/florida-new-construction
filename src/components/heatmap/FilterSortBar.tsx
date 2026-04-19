"use client";

import type { SortBy } from "~store/heatmap/slice";

interface FilterSortBarProps {
  sortBy: SortBy;
  filterBuilder: string | null;
  subdivisionSearch: string;
  builderOptions: string[];
  onSortChange: (v: SortBy) => void;
  onFilterBuilderChange: (v: string | null) => void;
  onSubdivisionSearchChange: (v: string) => void;
  onClearFilters: () => void;
}

const SORT_OPTIONS: Array<{ label: string; value: SortBy }> = [
  { label: "Velocity", value: "velocity" },
  { label: "Price", value: "price" },
  { label: "Builder", value: "builder" },
  { label: "Mkt Share", value: "market_share" },
];

export default function FilterSortBar({
  sortBy,
  filterBuilder,
  subdivisionSearch,
  builderOptions,
  onSortChange,
  onFilterBuilderChange,
  onSubdivisionSearchChange,
  onClearFilters,
}: FilterSortBarProps): React.ReactElement {
  const hasActiveFilters = filterBuilder !== null || subdivisionSearch !== "";

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 bg-gray-950 px-6 py-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">Sort</span>
        <div className="flex overflow-hidden rounded-sm border border-white/10">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSortChange(opt.value)}
              className={
                sortBy === opt.value
                  ? "bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-white transition-colors"
                  : "bg-gray-900 px-3 py-1 text-[10px] font-semibold tracking-wider text-gray-400 transition-colors hover:text-white"
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-4 w-px bg-white/10" />

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">Builder</span>
        <select
          value={filterBuilder ?? ""}
          onChange={(e) => onFilterBuilderChange(e.target.value === "" ? null : e.target.value)}
          className="rounded-sm border border-white/10 bg-gray-900 px-2 py-1 text-[10px] text-gray-300 focus:outline-none focus:ring-1 focus:ring-white/20"
        >
          <option value="">All builders</option>
          {builderOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="h-4 w-px bg-white/10" />

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">Search</span>
        <input
          type="text"
          placeholder="Subdivision name…"
          value={subdivisionSearch}
          onChange={(e) => onSubdivisionSearchChange(e.target.value)}
          className="w-44 rounded-sm border border-white/10 bg-gray-900 px-2 py-1 text-[10px] text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20"
        />
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="rounded-sm border border-white/10 px-2 py-1 text-[10px] text-gray-400 transition-colors hover:border-red-400/40 hover:text-red-400"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
