export class OaiPmhError extends Error {
  readonly response;

  constructor(responseOrMsg: Response | string) {
    super(
      typeof responseOrMsg === "string"
        ? responseOrMsg
        : `HTTP Error Response: ${responseOrMsg.status} ${responseOrMsg.statusText}`,
    );
    this.response = typeof responseOrMsg === "string" ? null : responseOrMsg;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
