import React from "react";

import type BaseError from "~errors/BaseError";
import { translate } from "~i18n";
import txKeys from "~i18n/translations";

import { fireAndForget } from "./fireAndForget";

import type { OptionsObject, SnackbarProvider } from "notistack";

const notistackRef = React.createRef<SnackbarProvider>();

export const enqueueSnackbar = (error: BaseError, variant: OptionsObject): void => {
  notistackRef.current?.enqueueSnackbar(error.errorCode, variant);
};

export function fireAndNotifyOnError(fn: () => Promise<void>): () => void {
  return fireAndForget(fn, () => {
    notistackRef.current?.enqueueSnackbar(translate(txKeys.common.generalError), { variant: "error" });
  });
}

export default notistackRef;
