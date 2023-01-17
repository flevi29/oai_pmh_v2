import { Code } from "./default_oai_pmh_parser.model.ts";

export class OaiPmhError extends Error {
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
    this.#code = code;
    this.#text = text;
  }
}
