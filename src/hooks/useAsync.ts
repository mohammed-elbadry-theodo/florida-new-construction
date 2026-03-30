import { useEffect } from "react";

import type { AsyncState, FunctionReturningPromise } from "./types";
import useAsyncFn from "./useAsyncFn";

import type { DependencyList } from "react";

export default function useAsync<Output>(
  fn: FunctionReturningPromise<[], Output>,
  deps: DependencyList = [],
): AsyncState<Output> {
  const [state, callback] = useAsyncFn(fn, deps, {
    loading: true,
  });

  useEffect(() => {
    // Error is handled in useAsyncFn, if in need of a sideEffect, add your handling to fn and re-reject
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    callback();
  }, [callback]);

  return state;
}
