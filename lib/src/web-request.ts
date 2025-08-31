import pkg from "../package.json" with { type: "json" };
import { OAIPMHRequestInitError } from "./error/request-init-error.js";
import { OAIPMHRequestTimeOutError } from "./error/request-timeout-error.js";
import { OAIPMHRequestError } from "./error/request-error.js";
import type {
  CustomRequestFn,
  HttpRequestsRequestInit,
  MainRequestOptions,
  OAIPMHRequestConstructorOptions as WebRequestConstructorOptions,
  URLSearchParamsRecord,
} from "./model/oai-pmh.js";

// TODO: https://www.openarchives.org/OAI/openarchivesprotocol.html#StatusCodes
//       status code and compression (just have to set Accept-Encoding, Fetch handles the rest theoretically)
//                                   (When a request includes an Accept-Encoding header the list of encodings
//                                    must include the identity (no compression) encoding (with a non-zero qvalue).)

/** Append a set of key value pairs to a {@link URLSearchParams} object. */
function appendRecordToURLSearchParams(
  searchParams: URLSearchParams,
  record: URLSearchParamsRecord,
): void {
  for (const [key, val] of Object.entries(record)) {
    if (val != null) {
      searchParams.set(key, val);
    }
  }
}

/**
 * Creates a new Headers object from a {@link HeadersInit} and adds various
 * properties to it, some from {@link Config}.
 *
 * @returns A new Headers object
 */
function getHeaders(headersInit?: HeadersInit): Headers {
  const headers = new Headers(headersInit);

  const userAgent = "User-Agent";
  if (!headers.has(userAgent)) {
    headers.set(userAgent, `${pkg.name}/${pkg.version}`);
  }

  const acceptEncoding = "Accept-Encoding";
  if (!headers.has(acceptEncoding)) {
    headers.set(acceptEncoding, "gzip, deflate, br, zstd, identity;q=1.0");
  }

  return headers;
}

/** Used to identify whether an error is a timeout error after fetch request. */
const TIMEOUT_ID = Symbol("<timeout>");

/**
 * Attach a timeout signal to a {@link RequestInit}, while preserving original
 * signal functionality, if there is one.
 *
 * @remarks
 * This could be a short few straight forward lines using {@link AbortSignal.any}
 * and {@link AbortSignal.timeout}, but these aren't yet widely supported enough,
 * nor polyfill -able, at the time of writing.
 * @returns A new function which starts the timeout, which then returns another
 *   function that clears the timeout
 */
function getTimeoutFn(
  requestInit: RequestInit,
  ms: number,
): () => (() => void) | void {
  const { signal } = requestInit;
  const ac = new AbortController();

  if (signal != null) {
    let acSignalFn: (() => void) | null = null;

    if (signal.aborted) {
      ac.abort(signal.reason);
    } else {
      const fn = () => ac.abort(signal.reason);

      signal.addEventListener("abort", fn, { once: true });

      acSignalFn = () => signal.removeEventListener("abort", fn);
      ac.signal.addEventListener("abort", acSignalFn, { once: true });
    }

    return () => {
      if (signal.aborted) {
        return;
      }

      const to = setTimeout(() => ac.abort(TIMEOUT_ID), ms);
      const fn = () => {
        clearTimeout(to);

        if (acSignalFn !== null) {
          ac.signal.removeEventListener("abort", acSignalFn);
        }
      };

      signal.addEventListener("abort", fn, { once: true });

      return () => {
        signal.removeEventListener("abort", fn);
        fn();
      };
    };
  }

  requestInit.signal = ac.signal;

  return () => {
    const to = setTimeout(() => ac.abort(TIMEOUT_ID), ms);
    return () => clearTimeout(to);
  };
}

export class WebRequest {
  readonly #baseUrl: URL;
  readonly #init: HttpRequestsRequestInit;
  readonly #usePost: boolean;
  readonly #requestFn?: CustomRequestFn;
  readonly #timeout?: number;

  // TODO: add a callback which allows using a different request fn than fetch
  //       this also allows to inject corsproxy https://corsproxy.io/?url=${encodeURIComponent(...)}
  constructor(options: WebRequestConstructorOptions) {
    let baseUrl = options.baseUrl;
    if (!baseUrl.endsWith("/")) {
      baseUrl += "/";
    }

    try {
      this.#baseUrl = new URL(baseUrl);
    } catch (error) {
      throw new Error("The provided base URL is not valid", {
        cause: error,
      });
    }

    this.#init = {
      ...options.init,
      headers: getHeaders(options.init?.headers),
    };

    this.#usePost = options.usePost ?? false;

    this.#requestFn = options.requestFn;
    this.#timeout = options.timeout;
  }

  /**
   * Combines provided extra {@link RequestInit} headers, provided content type
   * and class instance RequestInit headers, prioritizing them in this order.
   *
   * @returns A new Headers object or the main headers of this class if no
   *   headers are provided
   */
  #getHeaders(extraHeaders?: HeadersInit, postContentLength?: number): Headers {
    if (extraHeaders === undefined && postContentLength === undefined) {
      return this.#init.headers;
    }

    const headers = new Headers({
      ...Object.fromEntries(this.#init.headers.entries()),
      ...Object.fromEntries(new Headers(extraHeaders).entries()),
    });

    if (postContentLength !== undefined) {
      headers.set("Content-Type", "x-www-form-urlencoded");
      headers.set("Content-Length", postContentLength.toString());
    }

    return headers;
  }

  async request({
    params,
    post = this.#usePost,
    init: extraInit,
  }: MainRequestOptions): Promise<string> {
    const url = new URL(this.#baseUrl);

    const init: RequestInit = {
      ...this.#init,
      ...extraInit,
    };

    if (post) {
      init.method = "POST";
      init.body = new URLSearchParams(params).toString();
      init.headers = this.#getHeaders(extraInit?.headers, init.body.length);
    } else {
      appendRecordToURLSearchParams(url.searchParams, params);
      init.headers = this.#getHeaders(extraInit?.headers);
    }

    const startTimeout =
      this.#timeout !== undefined ? getTimeoutFn(init, this.#timeout) : null;

    const stopTimeout = startTimeout?.();

    let response: Response;
    let responseBody: string;

    try {
      if (this.#requestFn !== undefined) {
        // when using custom HTTP client, response is handled differently
        const resp = await this.#requestFn(url, init);

        if (!resp.success) {
          throw new OAIPMHRequestError(resp.value, resp.details);
        }

        return resp.value;
      }

      response = await fetch(url, init);
      responseBody = await response.text();
    } catch (error) {
      throw new OAIPMHRequestInitError(
        url.toString(),
        Object.is(error, TIMEOUT_ID)
          ? new OAIPMHRequestTimeOutError(this.#timeout!, init)
          : error,
      );
    } finally {
      stopTimeout?.();
    }

    if (!response.ok) {
      throw new OAIPMHRequestError(responseBody, response);
    }

    return responseBody;
  }
}
