import { OAIPMHSuccessResponse } from "../model/oai.ts";

export class ExpectedKeyError extends Error {
  readonly #parsedXML: OAIPMHSuccessResponse;
  get parsedXML() {
    return this.#parsedXML;
  }

  constructor(key: string, parsedXML: OAIPMHSuccessResponse) {
    super(`expected "${key}" key on object`);
    this.name = ExpectedKeyError.name;
    this.#parsedXML = parsedXML;
  }
}
