import { OAIBaseObj } from "../parser.model.ts";

export class ExpectedKeyError extends Error {
  readonly #parsedXml: OAIBaseObj;
  get parsedXml() {
    return this.#parsedXml;
  }

  constructor(key: string, parsedXml: OAIBaseObj) {
    super(`expected "${key}" key on object`);
    this.name = ExpectedKeyError.name;
    this.#parsedXml = parsedXml;
  }
}
