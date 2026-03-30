/* eslint-disable no-console */

import ApiError from "~errors/ApiError";
import type BaseError from "~errors/BaseError";
import NetworkError from "~errors/NetworkError";
import UnknownError from "~errors/UnknownError";

import type { AxiosError } from "axios";

function isApiError(error: unknown): error is ApiError {
  if (
    error !== null &&
    error !== undefined &&
    typeof error === "object" &&
    "errorCode" in error &&
    error.errorCode !== null &&
    "httpStatusCode" in error &&
    error.httpStatusCode !== null &&
    "message" in error &&
    "errorMetadata" in error
  )
    return true;
  return false;
}

export const logAndGetUnknownError = (error: unknown): UnknownError => {
  console.error("Caused by", error);
  return new UnknownError("Unknown error");
};

export const throwError = (error: AxiosError): BaseError => {
  const serverError = error.response?.data;
  if (isApiError(serverError)) {
    throw new ApiError(
      serverError.errorCode,
      serverError.message,
      serverError.httpStatusCode,
      serverError.errorMetadata,
    );
  }
  if (error.code === "ERR_NETWORK") {
    throw new NetworkError(error.message);
  }
  throw logAndGetUnknownError(error);
};
