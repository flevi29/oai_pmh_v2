import { UnexpectedStatusCodeError } from "./error/unexpected_status_code_error.ts";
import type { OAIPMHRequestConstructorOptions } from "./model/oai_pmh.ts";

export class OAIPMHRequest {
  readonly #baseURL: URL;
  readonly #init: RequestInit = {
    // @TODO: Should this be like so? Read more: https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options
    credentials: "omit",
    // @TODO: Maybe we shouldn't type check the npm build? Just type check with Deno?
    // @ts-ignore: No cache in Node.js fetch type definitions
    cache: "no-store",
  };

  constructor({
    baseURL,
    init,
  }: OAIPMHRequestConstructorOptions) {
    this.#baseURL = new URL(baseURL);

    if (init !== undefined) {
      this.#init = { ...this.#init, ...init };
    }
  }

  readonly request = async (
    searchParams: ConstructorParameters<typeof URLSearchParams>[0],
    init?: RequestInit,
  ): Promise<string> => {
    const url = new URL(this.#baseURL);

    if (searchParams !== undefined) {
      url.search = new URLSearchParams(searchParams).toString();
    }

    if (init?.headers !== undefined && this.#init.headers !== undefined) {
      // Make a shallow copy of init, so when merging headers underneath we
      // don't mutate a user provided value that they might re-use elsewhere
      init = { ...init };

      const defaultHeaders = new Headers(this.#init.headers),
        initHeaders = new Headers(init.headers);

      init.headers = {
        ...Object.fromEntries(defaultHeaders.entries()),
        ...Object.fromEntries(initHeaders.entries()),
      };
    }

    const response = await fetch(url, { ...this.#init, ...init });

    if (response.ok) {
      return await response.text();
    }

    const { status, statusText } = response;
    const responseBodyText = await response.text();

    throw new UnexpectedStatusCodeError(
      `request to ${response.url} failed with HTTP status ${status} ${statusText}${
        responseBodyText !== ""
          ? ` | response from server: ${responseBodyText}`
          : ""
      }`,
      response,
    );
  };
}
