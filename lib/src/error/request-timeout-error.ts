import { OAIPMHError } from "./error.js";

/** Error thrown when a HTTP request times out. */
export class OAIPMHRequestTimeOutError extends OAIPMHError {
  override name = "OAIPMHRequestTimeOutError";
  override cause: { timeout: number; init: RequestInit };

  constructor(timeout: number, init: RequestInit) {
    super(`request timed out after ${timeout}ms`);
    this.cause = { timeout, init };
  }
}
