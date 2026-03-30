import BaseError from "./BaseError";

export default class ApiError extends BaseError {
  public readonly errorMetadata: Object | null | undefined;
  public readonly httpStatusCode: number;

  public constructor(errorCode: string, message: string, httpStatusCode: number, errorMetadata?: Object | null) {
    super(errorCode, message);
    this.httpStatusCode = httpStatusCode;
    this.errorMetadata = errorMetadata;
  }
}
