import BaseError from "./BaseError";

export default class UnknownError extends BaseError {
  public constructor(message: string) {
    super("unknown_error", message);
  }
}
