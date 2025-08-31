import { OAIPMHError } from "./error.js";

export class OAIPMHRequestInitError extends OAIPMHError {
  override name = "OAIPMHRequestInitError";

  constructor(url: string, cause: unknown) {
    super(`request to ${url} has failed`, { cause });
  }
}
