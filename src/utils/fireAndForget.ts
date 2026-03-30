export function fireAndForget(fn: () => Promise<void>, onError: (error: unknown) => PromiseLike<void> | void) {
  return (): void => {
    fn().catch(onError);
  };
}
