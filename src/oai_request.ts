import { OAIPMHError } from "./oai_pmh_error.ts";
import { OAIPMHOptionsConstructor, RequestOptions } from "./oai_pmh.model.ts";

type SearchParamsRecord = Record<string, string | undefined>;

function recordToUrlSearchParams(
  record: SearchParamsRecord,
) {
  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(record)) {
    switch (typeof val) {
      case "undefined":
        continue;
      default:
        searchParams.set(key, val);
    }
  }
  return searchParams;
}

function getURLWithParameters(
  url: string,
  record?: SearchParamsRecord,
) {
  if (record === undefined) {
    return url;
  }
  const searchParams = recordToUrlSearchParams(record);
  return url + "?" + searchParams.toString();
}

async function checkResponse(response: Response) {
  if (!response.ok) {
    const { status, statusText } = response;
    const messageFromServer = await response.text();
    const errorMessage =
      `request to ${response.url} failed with HTTP status ${status} ${statusText}${
        messageFromServer.trim() !== ""
          ? ` | response from server: ${messageFromServer}`
          : ""
      }`;
    throw new OAIPMHError(errorMessage, { response });
  }
}

export class OAIRequest {
  readonly #baseURL: string;
  readonly #userAgent: { "User-Agent": string };
  readonly #debugLogRetries: boolean;

  #coerceAndCheckURL(url: URL | string) {
    if (typeof url === "string") {
      // if string is invalid URL this will throw
      new URL(url);
      return url;
    }
    return url.href;
  }

  constructor(
    options: OAIPMHOptionsConstructor,
  ) {
    const { baseUrl, userAgent } = options;
    this.#baseURL = this.#coerceAndCheckURL(baseUrl);
    this.#userAgent = { "User-Agent": userAgent || "oai_pmh_v2_js_client" };
    this.#debugLogRetries = options?.debugLogRetries ?? false;
  }

  request = async (
    searchParams: Record<string, string | undefined>,
    options?: RequestOptions,
  ): Promise<[xml: string, response: Response]> => {
    try {
      const response = await fetch(
        getURLWithParameters(this.#baseURL, searchParams),
        {
          signal: options?.signal,
          headers: this.#userAgent,
          credentials: "omit",
          cache: "no-store",
        },
      );
      // @TODO: @ts-ignore: No cache in undici type definitions
      await checkResponse(response);
      return [await response.text(), response];
    } catch (error: unknown) {
      const retry = options?.retry ?? 3;
      const retryInterval = options?.retryInterval ?? 1000;
      if (
        !(error instanceof OAIPMHError) || error.response === undefined ||
        error.response.status < 500 || retry < 1
      ) {
        throw error;
      }
      if (this.#debugLogRetries) {
        console.debug(error);
      }
      if (retryInterval > 0) {
        if (this.#debugLogRetries) {
          console.debug(
            `retrying request in ${retryInterval.toString(10)}ms"`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
      return this.request(searchParams, {
        ...options,
        retry: retry - 1,
      });
    }
  };
}
