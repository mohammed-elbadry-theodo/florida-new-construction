import { waitFor } from "~__test__/test-utils";

import { fireAndForget } from "./fireAndForget";

describe("fireAndForget", () => {
  it("should execute the passed function without throwing an error when the promise resolves", async () => {
    let promise: Promise<void>;
    const fakeFn = async () => {
      promise = Promise.resolve();
      return promise;
    };
    const fakeOnError = jest.fn();
    const wrappedFunction = fireAndForget(fakeFn, fakeOnError);

    wrappedFunction();
    // Bypassing the linting error because typescript cannot infer that the promise is defined after calling wrappedFunction
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await promise!;

    expect(fakeOnError).not.toHaveBeenCalled();
  });

  it("should call onError callback when the passed function promise rejects", async () => {
    const error = new Error("rejected");

    const fakeFn = async () => Promise.reject(error);
    const fakeOnError = jest.fn();
    const wrappedFunction = fireAndForget(fakeFn, fakeOnError);

    wrappedFunction();

    await waitFor(() => {
      expect(fakeOnError).toHaveBeenCalledTimes(1);
      expect(fakeOnError).toHaveBeenCalledWith(error);
    });
  });
});
