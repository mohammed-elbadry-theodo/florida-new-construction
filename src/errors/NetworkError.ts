import BaseError from "./BaseError";

export default class NetworkError extends BaseError {
  public constructor(message: string) {
    super("error_network", message);
  }
}
