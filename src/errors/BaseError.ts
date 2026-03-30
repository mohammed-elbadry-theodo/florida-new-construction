export default class BaseError extends Error {
  public readonly errorCode: string;

  public constructor(errorCode: string, message: string) {
    super(message);
    this.errorCode = errorCode;
  }
}
