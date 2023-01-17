import { FetchError } from "./fetch_error.ts";
import { getURLWithParameters } from "./url_search_params.ts";
import {
  ListOptions,
  OaiPmhOptionsConstructor,
  RequestOptions,
} from "./oai_pmh.model.ts";
import { IOaiPmhParser } from "./oai_pmh_parser/oai_pmh_parser.interface.ts";

export class OaiPmh<TParser extends IOaiPmhParser = IOaiPmhParser> {
  readonly #xmlParser: TParser;
  readonly #baseURL: string;
  readonly #userAgent: { "User-Agent": string };
  readonly #debugLogRetries: boolean;

  #coerceAndCheckURL(url: URL | string) {
    if (typeof url === "string") {
      // check if it's a valid URL
      new URL(url);
      return url;
    }
    return url.href;
  }

  constructor(parser: TParser, options: OaiPmhOptionsConstructor) {
    this.#xmlParser = parser;
    const { baseUrl, userAgent } = options;
    this.#baseURL = this.#coerceAndCheckURL(baseUrl);
    this.#userAgent = { "User-Agent": userAgent || "oai_pmh_v2" };
    this.#debugLogRetries = options?.debugLogRetries ?? false;
  }

  async #checkResponse(response: Response) {
    if (!response.ok) {
      const { status, statusText } = response;
      const messageFromServer = await response.text();
      const errorMessage =
        `request to ${response.url} failed with HTTP status ${status} ${statusText}${
          messageFromServer.trim() !== ""
            ? ` | response from server: ${messageFromServer}`
            : ""
        }`;
      throw new FetchError(errorMessage, response);
    }
  }

  async #request(
    searchParams: Record<string, string | undefined>,
    options?: RequestOptions,
  ): Promise<string> {
    try {
      const response = await fetch(
        getURLWithParameters(this.#baseURL, searchParams),
        {
          signal: options?.signal,
          headers: this.#userAgent,
          // @ts-ignore: In node-fetch mode doesn't exist
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
        },
      );
      await this.#checkResponse(response);
      return response.text();
    } catch (error: unknown) {
      const retry = options?.retry ?? 3;
      const retryInterval = options?.retryInterval ?? 1000;
      if (
        !(error instanceof FetchError) || error.response === undefined ||
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
      return this.#request(searchParams, {
        ...options,
        retry: retry - 1,
      });
    }
  }

  async identify(
    requestOptions?: RequestOptions,
  ): Promise<ReturnType<TParser["parseIdentify"]>> {
    const xml = await this.#request(
      { verb: "Identify" },
      requestOptions,
    );
    return this.#xmlParser.parseIdentify(xml);
  }

  async getRecord(
    identifier: string,
    metadataPrefix: string,
    requestOptions?: RequestOptions,
  ): Promise<ReturnType<TParser["parseGetRecord"]>> {
    const xml = await this.#request(
      {
        verb: "GetRecord",
        identifier,
        metadataPrefix,
      },
      requestOptions,
    );
    return this.#xmlParser.parseGetRecord(xml);
  }

  async *#list(
    parseListCallback:
      | TParser["parseListIdentifiers"]
      | TParser["parseListRecords"],
    verb:
      | "ListIdentifiers"
      | "ListRecords",
    options: {
      listOptions: ListOptions;
      requestOptions?: RequestOptions;
    },
  ) {
    const { listOptions, requestOptions } = options;
    const xml = await this.#request(
      { ...listOptions, verb },
      requestOptions,
    );
    let next = parseListCallback(xml);
    yield next.records;

    while (next.resumptionToken !== null) {
      const xml = await this.#request(
        { verb, resumptionToken: next.resumptionToken },
        requestOptions,
      );
      next = parseListCallback(xml);
      yield next.records;
    }
  }

  listIdentifiers(
    listOptions: ListOptions,
    requestOptions?: RequestOptions,
  ): AsyncGenerator<
    ReturnType<TParser["parseListIdentifiers"]>["records"],
    void
  > {
    return this.#list(
      this.#xmlParser.parseListIdentifiers.bind(this.#xmlParser),
      "ListIdentifiers",
      { listOptions, requestOptions },
    );
  }

  async listMetadataFormats(
    identifier?: string,
    requestOptions?: RequestOptions,
  ): Promise<ReturnType<TParser["parseListMetadataFormats"]>> {
    const xml = await this.#request(
      { verb: "ListMetadataFormats", identifier },
      requestOptions,
    );
    return this.#xmlParser.parseListMetadataFormats(xml);
  }

  listRecords(
    listOptions: ListOptions,
    requestOptions?: RequestOptions,
  ): AsyncGenerator<
    ReturnType<TParser["parseListRecords"]>["records"],
    void
  > {
    return this.#list(
      this.#xmlParser.parseListRecords.bind(this.#xmlParser),
      "ListRecords",
      { listOptions, requestOptions },
    );
  }

  async listSets(
    requestOptions?: RequestOptions,
  ): Promise<ReturnType<TParser["parseListSets"]>> {
    const xml = await this.#request(
      { verb: "ListSets" },
      requestOptions,
    );
    return this.#xmlParser.parseListSets(xml);
  }
}
