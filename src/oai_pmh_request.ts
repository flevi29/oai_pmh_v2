import { UnexpectedStatusCodeError } from "./error/unexpected_status_code_error.ts";
import type {
  OAIPMHRequestConstructorOptions,
  RequestOptions,
} from "./model/oai_pmh.ts";

type SearchParamsRecord = Record<string, string | undefined>;

function recordToURLSearchParams(record: SearchParamsRecord) {
  const searchParams = new URLSearchParams();

  for (const [key, val] of Object.entries(record)) {
    if (val === undefined) {
      continue;
    }

    searchParams.set(key, val);
  }

  return searchParams;
}

function getURLWithParameters(
  url: string,
  searchParamsRecord: SearchParamsRecord,
) {
  return `${url}?${recordToURLSearchParams(searchParamsRecord)}`;
}

async function checkResponse(
  response: Response,
): Promise<UnexpectedStatusCodeError | null> {
  if (response.ok) {
    return null;
  }

  const { status, statusText } = response;
  const messageFromServer = await response.text();
  const errorMessage =
    `request to ${response.url} failed with HTTP status ${status} ${statusText}${
      messageFromServer.trim() !== ""
        ? ` | response from server: ${messageFromServer}`
        : ""
    }`;

  return new UnexpectedStatusCodeError(errorMessage, response);
}

function coerceAndCheckURL(url: URL | string) {
  if (typeof url === "string") {
    // if string is invalid URL this will throw
    new URL(url);
    return url;
  }
  return url.href;
}

export class OAIPMHRequest {
  readonly #baseURL: string;
  readonly #headers = new Headers();
  readonly #debugLogRetries: boolean;

  constructor(options: OAIPMHRequestConstructorOptions) {
    const { baseURL, userAgent } = options;
    this.#baseURL = coerceAndCheckURL(baseURL);
    this.#headers.set("User-Agent", userAgent || "oai_pmh_v2_js");
    this.#debugLogRetries = options?.debugLogRetries ?? false;
  }

  request = async (
    searchParams: SearchParamsRecord,
    options?: RequestOptions,
  ): Promise<string> => {
    const signal = options?.signal;

    const response = await fetch(
      getURLWithParameters(this.#baseURL, searchParams),
      {
        signal: signal,
        headers: this.#headers,
        credentials: "omit",
        // @TODO: Maybe we shouldn't type check the npm build? Just type check with Deno?
        // @ts-ignore: No cache in Node.js fetch type definitions
        cache: "no-store",
      },
    );

    const responseError = await checkResponse(response);
    // @TODO: Should there be a retry thingy here? Research whether there are better options!
    if (responseError !== null) {
      const retry = options?.retry ?? 3;
      const retryInterval = options?.retryInterval ?? 1000;

      if (responseError.response.status < 500 || retry < 1) {
        throw responseError;
      }

      if (this.#debugLogRetries) {
        console.debug(responseError);
      }

      if (retryInterval > 0) {
        if (this.#debugLogRetries) {
          console.debug(`retrying request in ${retryInterval}ms"`);
        }

        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }

      return this.request(searchParams, {
        ...options,
        retry: retry - 1,
      });
    }

    return await response.text();
  };
}
