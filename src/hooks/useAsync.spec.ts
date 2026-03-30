import { useCallback } from "react";

import type { RenderHookResult } from "~__test__/test-utils";
import { act, renderHook, waitFor } from "~__test__/test-utils";

import type { AnyFunctionArguments, AsyncState } from "./types";
import useAsync from "./useAsync";

describe("useAsync", () => {
  it("should be defined", () => {
    expect(useAsync).toBeDefined();
  });

  // Extracted delayed pattern function
  const createDelayedFunction = <Input extends AnyFunctionArguments, Output>(
    delayedAction: (
      resolve: (value: Output | PromiseLike<Output>) => void,
      reject?: (reason?: Error) => void,
    ) => (...args: Input) => void,
  ) => {
    let promise: Promise<Output>;
    let triggerAction: () => void;
    let callCount = 0;

    const delayedFn = async (...input: Input) => {
      promise = new Promise<Output>((resolve, reject) => {
        callCount++;
        triggerAction = () => {
          delayedAction(resolve, reject)(...input);
        };
      });
      return promise;
    };

    return {
      delayedFn,
      getPromise: async () => promise,
      triggerAction: () => {
        triggerAction();
      },
      countCalls: () => callCount,
      resetCallCount: () => {
        callCount = 0;
      },
    };
  };

  describe("a success", () => {
    const { delayedFn, getPromise, triggerAction, countCalls, resetCallCount } = createDelayedFunction<[], string>(
      (resolve) => () => {
        resolve("yay");
      },
    );

    let hook: RenderHookResult<AsyncState<string>, { fn: () => Promise<string> }>;

    beforeEach(() => {
      resetCallCount();
      hook = renderHook<AsyncState<string>, { fn: () => Promise<string> }>(({ fn }) => useAsync(fn, [fn]), {
        initialProps: {
          fn: delayedFn,
        },
      });
    });

    it("initially starts loading", () => {
      expect(hook.result.current.loading).toEqual(true);
    });

    it("resolves", async () => {
      await act(async () => {
        triggerAction();
        await getPromise();
      });
      expect(countCalls()).toEqual(1);
      expect(hook.result.current.loading).toBeFalsy();
      expect(hook.result.current.value).toEqual("yay");
      expect(hook.result.current.error).toEqual(undefined);
    });
  });

  describe("an error", () => {
    const { delayedFn, triggerAction, countCalls, resetCallCount } = createDelayedFunction<[], string>(
      (_, reject) => () => {
        if (reject !== undefined) reject(new Error("yay"));
      },
    );

    let hook: RenderHookResult<AsyncState<string>, { fn: () => Promise<string> }>;

    beforeEach(() => {
      resetCallCount();
      hook = renderHook<AsyncState<string>, { fn: () => Promise<string> }>(({ fn }) => useAsync(fn, [fn]), {
        initialProps: {
          fn: delayedFn,
        },
      });
    });

    it("initially starts loading", () => {
      expect(hook.result.current.loading).toBeTruthy();
    });

    /**
     * Before unskipping this test you can try reading:
     * https://github.com/jestjs/jest/issues/5620
     * https://johann.pardanaud.com/blog/how-to-assert-unhandled-rejection-and-uncaught-exception-with-jest/
     */
    it.skip("rejects", async () => {
      act(() => {
        triggerAction();
      });

      await waitFor(() => {
        expect(countCalls()).toEqual(1);
        expect(hook.result.current.loading).toBeFalsy();
        expect(hook.result.current.error).toEqual(new Error("yay"));
        expect(hook.result.current.value).toEqual(undefined);
      });
    });
  });

  describe("re-evaluates when dependencies change", () => {
    describe("the fn is a dependency", () => {
      let hook: RenderHookResult<AsyncState<string>, { fn: () => Promise<string> }>;

      const {
        delayedFn: initialFn,
        triggerAction: triggerInitialFn,
        getPromise: getInitialPromise,
        countCalls: countInitialCalls,
        resetCallCount: resetInitialCalls,
      } = createDelayedFunction<[], string>((resolve) => () => {
        resolve("value");
      });
      const {
        delayedFn: differentFn,
        triggerAction: triggerDifferentFn,
        getPromise: getDifferentPromise,
        countCalls: countDifferentCalls,
        resetCallCount: resetDifferentCalls,
      } = createDelayedFunction<[], string>((resolve) => () => {
        resolve("new value");
      });

      const countCalls = () => countInitialCalls() + countDifferentCalls();
      const resetCallCount = () => {
        resetInitialCalls();
        resetDifferentCalls();
      };
      beforeEach(() => {
        resetCallCount();

        hook = renderHook<AsyncState<string>, { fn: () => Promise<string> }>(({ fn }) => useAsync(fn, [fn]), {
          initialProps: { fn: initialFn },
        });
      });

      it("renders the first value", async () => {
        await act(async () => {
          triggerInitialFn();
          await getInitialPromise();
        });
        expect(hook.result.current.value).toEqual("value");
      });

      it("renders a different value when deps change", async () => {
        expect.assertions(3);

        await act(async () => {
          triggerInitialFn();
          await getInitialPromise();
        });
        expect(countCalls()).toEqual(1);

        hook.rerender({ fn: differentFn }); // change the fn to initiate new request
        await act(async () => {
          triggerDifferentFn();
          await getDifferentPromise();
        });

        expect(countCalls()).toEqual(2);
        expect(hook.result.current.value).toEqual("new value");
      });
    });

    describe("the additional dependencies list changes", () => {
      let hook: RenderHookResult<AsyncState<string>, { fn: (value: string) => Promise<string>; state: string }>;

      const { delayedFn, triggerAction, getPromise, countCalls, resetCallCount } = createDelayedFunction<
        [string],
        string
      >((resolve) => (value) => {
        resolve(`state is ${value}`);
      });

      beforeEach(() => {
        resetCallCount();
        hook = renderHook<AsyncState<string>, { fn: (value: string) => Promise<string>; state: string }>(
          ({ fn, state }) => {
            const callback = useCallback(async () => fn(state), [state, fn]);
            return useAsync<string>(callback, [callback]);
          },
          {
            initialProps: {
              state: "initial",
              fn: delayedFn,
            },
          },
        );
      });

      it("initial renders the first passed args", async () => {
        await act(async () => {
          triggerAction();
          await getPromise();
        });
        expect(hook.result.current.value).toEqual("state is initial");
        expect(countCalls()).toEqual(1);
      });

      it("renders a different value when deps change", async () => {
        expect.assertions(2);

        await act(async () => {
          triggerAction();
          await getPromise();
        });

        hook.rerender({ fn: delayedFn, state: "updated" });
        await act(async () => {
          triggerAction();
          await getPromise();
        });

        expect(hook.result.current.value).toEqual("state is updated");
        expect(countCalls()).toEqual(2);
      });
    });
  });
});
