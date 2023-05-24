import { OAIErrorCode } from "../parser.model.ts";

export class ParsedOAIPMHError extends Error {
  readonly #code: OAIErrorCode;
  get code() {
    return this.#code;
  }

  readonly #text?: string;
  get text() {
    return this.#text;
  }

  constructor(message: string, code: OAIErrorCode, text?: string) {
    super(message);
    this.name = ParsedOAIPMHError.name;
    this.#code = code;
    this.#text = text;
  }
}
