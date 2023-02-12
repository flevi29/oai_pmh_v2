export class NonConformingError extends Error {
  readonly #obj: Record<string, unknown>;
  get obj() {
    return this.#obj;
  }

  constructor(obj: Record<string, unknown>) {
    super("returned data does not conform to OAI-PMH");
    this.name = NonConformingError.name;
    this.#obj = obj;
  }
}
