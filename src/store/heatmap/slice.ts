/* eslint-disable no-param-reassign */
import type { HomeType, MetricType } from "~components/heatmap/types";
import type { RootState } from "~store/types";

import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

type HeatmapState = {
  selectedCounty: string | null;
  metric: MetricType;
  homeType: HomeType;
};

const initialState: HeatmapState = {
  selectedCounty: null,
  metric: "velocity",
  homeType: "sfh",
};

const heatmapSlice = createSlice({
  name: "heatmap",
  initialState,

  reducers: {
    setSelectedCounty: (state, action: PayloadAction<string | null>) => {
      state.selectedCounty = action.payload;
    },
    setMetric: (state, action: PayloadAction<MetricType>) => {
      state.metric = action.payload;
    },
    setHomeType: (state, action: PayloadAction<HomeType>) => {
      state.homeType = action.payload;
    },
  },
});

export const { setSelectedCounty, setMetric, setHomeType } = heatmapSlice.actions;

export const selectSelectedCounty = (state: RootState): string | null => state.heatmap.selectedCounty;
export const selectMetric = (state: RootState): MetricType => state.heatmap.metric;
export const selectHomeType = (state: RootState): HomeType => state.heatmap.homeType;

export const { reducer: heatmapReducer } = heatmapSlice;
