export class OAIPMHError extends Error {
  readonly #response?: Response;

  get response() {
    return this.#response;
  }

  constructor(
    message: string,
    options?: { response?: Response; cause?: unknown },
  ) {
    super(message);
    this.name = OAIPMHError.name;
    this.#response = options?.response;
    this.cause = options?.cause;
  }
}
