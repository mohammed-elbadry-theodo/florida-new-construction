// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunctionArguments = any[];
export type FunctionReturningPromise<Input extends AnyFunctionArguments, Output> = (...args: Input) => Promise<Output>;

export type AsyncState<T> =
  | {
      loading: boolean;
      error?: undefined;
      value?: T;
    }
  | {
      loading: false;
      error?: Error;
      value?: T;
    }
  | {
      loading: false;
      error?: undefined;
      value: T;
    }
  | {
      loading: true;
      error?: Error;
      value?: T;
    };

export type AsyncFnReturn<Input extends AnyFunctionArguments, Output> = [
  AsyncState<Output>,
  FunctionReturningPromise<Input, Output>,
];
