import { OaiPmhError } from "./errors/oai_pmh_error.ts";
import type {
  BaseOptions,
  ListOptions,
  OaiPmhOptionsConstructor,
  RequestOptions,
} from "./oai_pmh.model.ts";
import type { IOaiPmhParser } from "./oai_pmh_parser/oai_pmh_parser.interface.ts";

export class OaiPmh<TParser extends IOaiPmhParser = IOaiPmhParser> {
  readonly #xmlParser: TParser;
  readonly #requestOptions: BaseOptions;

  constructor(parser: TParser, options: OaiPmhOptionsConstructor) {
    this.#xmlParser = parser;
    this.#requestOptions = {
      baseUrl: new URL(options.baseUrl),
      userAgent: { "User-Agent": options.userAgent || "oai_pmh_v2" },
    };
  }

  async #checkResponse(response: Response) {
    if (!response.ok) {
      const { status, statusText } = response;
      const errorMsg = await response.text();
      const msg = `HTTP Error response: ${status} ${statusText}${
        errorMsg.trim() ? ` | ${errorMsg}` : ""
      }`;
      throw new OaiPmhError(msg, status);
    }
  }

  #getNewURLWithSearchParams(
    url: URL,
    record: Record<string, undefined | string>,
  ) {
    const newUrl = new URL(url);
    for (const [key, val] of Object.entries(record)) {
      if (val === void 0) {
        continue;
      }
      newUrl.searchParams.set(key, val);
    }
    return newUrl;
  }

  async #request(
    searchParams: Record<string, string | undefined>,
    options?: RequestOptions,
  ): Promise<string> {
    try {
      const response = await fetch(
        this.#getNewURLWithSearchParams(
          this.#requestOptions.baseUrl,
          searchParams,
        ).href,
        {
          signal: options?.signal,
          headers: this.#requestOptions.userAgent,
          // @ts-ignore: In node-fetch mode doesn't exist
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
        },
      );
      await this.#checkResponse(response);
      return response.text();
    } catch (err: unknown) {
      if (
        err instanceof OaiPmhError &&
        err.httpStatus !== void 0 &&
        err.httpStatus >= 500 && options?.retry !== void 0
      ) {
        const { retry } = options;
        if (retry > 0) {
          return this.#request(searchParams, {
            ...options,
            retry: retry - 1,
          });
        }
      }
      throw err;
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
