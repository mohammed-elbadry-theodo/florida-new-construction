import { counterReducer } from "./counter/slice";

import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
