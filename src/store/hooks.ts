import type { AppDispatch, RootState } from "./types";

import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

// Dispatch Type is a big boy type, for the sake of keeping
// the most complete intelisense we're going to ignore this rule, sorry eslint.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
