import BaseError from "~errors/BaseError";

import { enqueueSnackbar } from "./notistackRef";

import { QueryClient } from "react-query";

const enqueueErrorsOnSnacks = (error: unknown) => {
  if (error instanceof BaseError) {
    enqueueSnackbar(error, { variant: "error" });
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      onError: (error) => {
        enqueueErrorsOnSnacks(error);
      },
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        enqueueErrorsOnSnacks(error);
      },
    },
  },
});
