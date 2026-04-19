/* eslint-disable no-param-reassign */
import type { HomeType, MetricType } from "~components/heatmap/types";
import type { RootState } from "~store/types";

import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export type SortBy = "velocity" | "price" | "builder" | "market_share";

type HeatmapState = {
  selectedCounty: string | null;
  selectedSubdivision: string | null;
  selectedBuilder: string | null;
  metric: MetricType;
  homeType: HomeType;
  sortBy: SortBy;
  filterPriceMin: number | null;
  filterPriceMax: number | null;
  filterBuilder: string | null;
  filterStatus: string | null;
};

const initialState: HeatmapState = {
  selectedCounty: null,
  selectedSubdivision: null,
  selectedBuilder: null,
  metric: "velocity",
  homeType: "sfh",
  sortBy: "velocity",
  filterPriceMin: null,
  filterPriceMax: null,
  filterBuilder: null,
  filterStatus: null,
};

const heatmapSlice = createSlice({
  name: "heatmap",
  initialState,

  reducers: {
    setSelectedCounty: (state, action: PayloadAction<string | null>) => {
      state.selectedCounty = action.payload;
      state.selectedSubdivision = null;
      state.selectedBuilder = null;
    },
    setSelectedSubdivision: (state, action: PayloadAction<string | null>) => {
      state.selectedSubdivision = action.payload;
    },
    setSelectedBuilder: (state, action: PayloadAction<string | null>) => {
      state.selectedBuilder = action.payload;
    },
    setMetric: (state, action: PayloadAction<MetricType>) => {
      state.metric = action.payload;
    },
    setHomeType: (state, action: PayloadAction<HomeType>) => {
      state.homeType = action.payload;
    },
    setSortBy: (state, action: PayloadAction<SortBy>) => {
      state.sortBy = action.payload;
    },
    setFilterPriceRange: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.filterPriceMin = action.payload.min;
      state.filterPriceMax = action.payload.max;
    },
    setFilterBuilder: (state, action: PayloadAction<string | null>) => {
      state.filterBuilder = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<string | null>) => {
      state.filterStatus = action.payload;
    },
    clearBuilderFilters: (state) => {
      state.selectedBuilder = null;
      state.filterPriceMin = null;
      state.filterPriceMax = null;
      state.filterBuilder = null;
      state.filterStatus = null;
      state.sortBy = "velocity";
    },
  },
});

export const {
  setSelectedCounty,
  setSelectedSubdivision,
  setSelectedBuilder,
  setMetric,
  setHomeType,
  setSortBy,
  setFilterPriceRange,
  setFilterBuilder,
  setFilterStatus,
  clearBuilderFilters,
} = heatmapSlice.actions;

export const selectSelectedCounty = (state: RootState): string | null => state.heatmap.selectedCounty;
export const selectSelectedSubdivision = (state: RootState): string | null => state.heatmap.selectedSubdivision;
export const selectSelectedBuilder = (state: RootState): string | null => state.heatmap.selectedBuilder;
export const selectMetric = (state: RootState): MetricType => state.heatmap.metric;
export const selectHomeType = (state: RootState): HomeType => state.heatmap.homeType;
export const selectSortBy = (state: RootState): SortBy => state.heatmap.sortBy;
export const selectFilterPriceMin = (state: RootState): number | null => state.heatmap.filterPriceMin;
export const selectFilterPriceMax = (state: RootState): number | null => state.heatmap.filterPriceMax;
export const selectFilterBuilder = (state: RootState): string | null => state.heatmap.filterBuilder;
export const selectFilterStatus = (state: RootState): string | null => state.heatmap.filterStatus;

export const { reducer: heatmapReducer } = heatmapSlice;
