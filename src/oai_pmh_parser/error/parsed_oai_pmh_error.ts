import { OAIPMHErrorCode, OAIPMHErrorResponse } from "../model/oai.ts";

export class ParsedOAIPMHError extends Error {
  readonly #returnedErrors: { code: OAIPMHErrorCode; text?: string }[];
  get returnedErrors() {
    return this.#returnedErrors;
  }

  constructor(error: OAIPMHErrorResponse) {
    super("OAI-PMH provider returned error(s)");
    this.name = ParsedOAIPMHError.name;

    this.#returnedErrors = error.map((v) => ({ code: v.attr["@_code"], text: v.val }));
  }
}
