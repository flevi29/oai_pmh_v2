export class FetchError extends Error {
  readonly #response?: Response;

  get response() {
    return this.#response;
  }

  constructor(message: string, response?: Response) {
    super(message);
    this.#response = response;
  }
}
