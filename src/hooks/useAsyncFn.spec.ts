// NOTE: most behavior that useAsyncFn provides
//       is covered be the useAsync tests.
//
// The main difference is that useAsyncFn
// does not automatically invoke the function
// and it can take arguments.

import type { RenderHookResult } from "~__test__/test-utils";
import { act, renderHook } from "~__test__/test-utils";

import type { AsyncState } from "./types";
import useAsyncFn from "./useAsyncFn";

type AdderFn = (a?: number, b?: number) => Promise<number>;

describe("useAsyncFn", () => {
  it("should be defined", () => {
    expect(useAsyncFn).toBeDefined();
  });

  describe("the callback can be awaited and return the value", () => {
    let hook: RenderHookResult<[AsyncState<number>, AdderFn], { fn: AdderFn }>;
    const adder: AdderFn = async (param1?: number, param2?: number): Promise<number> => {
      return Promise.resolve((param1 ?? 0) + (param2 ?? 0));
    };

    beforeEach(() => {
      // NOTE: renderHook isn't good at inferring array types
      hook = renderHook<[AsyncState<number>, AdderFn], { fn: AdderFn }>(({ fn }) => useAsyncFn(fn), {
        initialProps: { fn: adder },
      });
    });

    it("awaits the result", async () => {
      expect.assertions(3);

      const [, callback] = hook.result.current;
      let result;

      await act(async () => {
        result = await callback(5, 7);
      });

      expect(result).toEqual(12);

      const [state] = hook.result.current;

      expect(state.value).toEqual(12);
      expect(result).toEqual(state.value);
    });
  });

  describe("args can be passed to the function", () => {
    let hook: RenderHookResult<[AsyncState<number>, AdderFn], { fn: AdderFn }>;
    let callCount = 0;
    const adder = async (param1?: number, param2?: number): Promise<number> => {
      callCount++;
      return Promise.resolve((param1 ?? 0) + (param2 ?? 0));
    };

    beforeEach(() => {
      // NOTE: renderHook isn't good at inferring array types
      hook = renderHook<[AsyncState<number>, AdderFn], { fn: AdderFn }>(({ fn }) => useAsyncFn(fn), {
        initialProps: {
          fn: adder,
        },
      });
    });

    it("initially does not have a value", () => {
      const [state] = hook.result.current;

      expect(state.value).toEqual(undefined);
      expect(state.loading).toEqual(false);
      expect(state.error).toEqual(undefined);
      expect(callCount).toEqual(0);
    });

    describe("when invoked", () => {
      it("resolves a value derived from args", async () => {
        expect.assertions(4);

        const [, callback] = hook.result.current;

        await act(async () => {
          await callback(2, 7);
        });
        hook.rerender({ fn: adder });
        // // TODO: check documentation for how to waitForNextUpdate in last version
        // await hook.waitForNextUpdate();

        const [state] = hook.result.current;

        expect(callCount).toEqual(1);
        expect(state.loading).toEqual(false);
        expect(state.error).toEqual(undefined);
        expect(state.value).toEqual(9);
      });
    });
  });

  it("should only consider last call and discard previous ones", async () => {
    const queuedPromises: Array<{ id: number; resolve: () => void }> = [];
    const delayedFunction1 = async () => {
      return new Promise<number>((resolve) => {
        queuedPromises.push({
          id: 1,
          resolve: () => {
            resolve(1);
          },
        });
      });
    };
    const delayedFunction2 = async () => {
      return new Promise<number>((resolve) => {
        queuedPromises.push({
          id: 2,
          resolve: () => {
            resolve(2);
          },
        });
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    let promise1: Promise<number | void>;
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    let promise2: Promise<number | void>;

    const hook = renderHook<[AsyncState<number>, () => Promise<number>], { fn: () => Promise<number> }>(
      ({ fn }) => useAsyncFn(fn, [fn]),
      {
        initialProps: { fn: delayedFunction1 },
      },
    );
    act(() => {
      promise1 = hook.result.current[1](); // invoke 1st callback
    });

    hook.rerender({ fn: delayedFunction2 });
    act(() => {
      promise2 = hook.result.current[1](); // invoke 2nd callback
    });

    await act(async () => {
      queuedPromises[1]?.resolve();
      queuedPromises[0]?.resolve();
      await promise2;
      await promise1;
    });
    expect(hook.result.current[0]).toEqual({ loading: false, value: 2 });
  });

  it("should keeping value of initialState when loading", async () => {
    let resolveFetch: () => void;
    const delayedFetch = async () => {
      return new Promise<string>((resolve) => {
        resolveFetch = () => {
          resolve("new state");
        };
      });
    };
    const initialState = { loading: false, value: "init state" };

    const hook = renderHook<[AsyncState<string>, () => Promise<string>], { fn: () => Promise<string> }>(
      ({ fn }) => useAsyncFn(fn, [fn], initialState),
      {
        initialProps: { fn: delayedFetch },
      },
    );

    const [state, callback] = hook.result.current;
    expect(state.loading).toBe(false);
    expect(state.value).toBe("init state");
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    let promise: Promise<string | void>;
    act(() => {
      promise = callback();
    });

    expect(hook.result.current[0].loading).toBe(true);
    expect(hook.result.current[0].value).toBe("init state");

    await act(async () => {
      resolveFetch();
      await promise;
    });
    expect(hook.result.current[0].loading).toBe(false);
    expect(hook.result.current[0].value).toBe("new state");
  });
});
