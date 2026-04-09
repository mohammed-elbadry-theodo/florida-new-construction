import { counterReducer } from "./counter/slice";
import { heatmapReducer } from "./heatmap/slice";

import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    heatmap: heatmapReducer,
  },
});
