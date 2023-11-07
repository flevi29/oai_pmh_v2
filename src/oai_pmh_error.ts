export class OAIPMHError extends Error {
  override name = OAIPMHError.name;
  readonly #response?: Response;

  get response() {
    return this.#response;
  }

  constructor(
    message: string,
    options?: { response?: Response; cause?: unknown },
  ) {
    super(message);

    if (options !== undefined) {
      this.#response = options.response;
      this.cause = options.cause;
    }
  }
}
