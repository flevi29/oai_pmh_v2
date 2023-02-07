import { Code } from "./parser.model.ts";

export class ParsedOAIPMHError extends Error {
  readonly #code: Code;
  get code() {
    return this.#code;
  }

  readonly #text?: string;
  get text() {
    return this.#text;
  }

  constructor(message: string, code: Code, text?: string) {
    super(message);
    this.name = ParsedOAIPMHError.name;
    this.#code = code;
    this.#text = text;
  }
}
