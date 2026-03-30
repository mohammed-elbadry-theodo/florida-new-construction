import { useCallback, useRef, useState } from "react";

import type { AnyFunctionArguments, AsyncFnReturn, AsyncState, FunctionReturningPromise } from "./types";
import useMountedState from "./useMountedState";

import type { DependencyList } from "react";

export default function useAsyncFn<Input extends AnyFunctionArguments, Output>(
  fn: FunctionReturningPromise<Input, Output>,
  deps: DependencyList = [],
  initialState: AsyncState<Output> = { loading: false },
): AsyncFnReturn<Input, Output> {
  const lastCallId = useRef(0);
  const isMounted = useMountedState();
  const [state, set] = useState<AsyncState<Output>>(initialState);

  const callback = useCallback(async (...args: Input): Promise<Output> => {
    const callId = ++lastCallId.current;

    if (!state.loading) {
      set((prevState) => ({ ...prevState, loading: true }));
    }

    return fn(...args)
      .then((value) => {
        isMounted() && callId === lastCallId.current && set({ value, loading: false });

        return value;
      })
      .catch(async (error: Error) => {
        isMounted() && callId === lastCallId.current && set({ error, loading: false });
        return Promise.reject(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [state, callback];
}
