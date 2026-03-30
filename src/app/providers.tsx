"use client";

import React, { StrictMode } from "react";

import { TranslationProvider } from "~i18n";
import { StoreProvider } from "~store/provider";
import notistackRef from "~utils/notistackRef";
import { queryClient } from "~utils/queryClient";

import { SnackbarProvider } from "notistack";
import { QueryClientProvider } from "react-query";

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <StrictMode>
      <StoreProvider>
        <TranslationProvider>
          <SnackbarProvider ref={notistackRef} maxSnack={2}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </SnackbarProvider>
        </TranslationProvider>
      </StoreProvider>
    </StrictMode>
  );
};
