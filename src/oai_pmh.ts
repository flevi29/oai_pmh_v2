import { OaiPmhError } from "./errors/oai_pmh_error.ts";
import { applyRecordToURLSearchParams } from "./util/apply_record_to_url_search_params.ts";
import type {
  BaseOptions,
  ListOptions,
  OaiPmhOptionsConstructor,
  RequestOptions,
} from "./oai_pmh.model.ts";
import type { OaiPmhParserInterface } from "./oai_pmh_parser/oai_pmh_parser.interface.ts";

export class OaiPmh<Parser extends OaiPmhParserInterface> {
  readonly #xmlParser: Parser;
  readonly #requestOptions: BaseOptions;

  constructor(parser: Parser, options: OaiPmhOptionsConstructor) {
    this.#xmlParser = parser;
    this.#requestOptions = {
      baseUrl: new URL(options.baseUrl),
      userAgent: { "User-Agent": options.userAgent || "oai_pmh_v2" },
    };
  }

  async #checkResponse(response: Response) {
    if (response.ok) return;
    const { status, statusText } = response;
    const errorMsg = await response.text();
    const msg = `HTTP Error response: ${status} ${statusText}${
      errorMsg.trim() ? ` | ${errorMsg}` : ""
    }`;
    throw new OaiPmhError(msg, status);
  }

  async #request(
    searchParams: Record<string, string | undefined>,
    options?: RequestOptions,
  ): Promise<string> {
    const url = new URL(this.#requestOptions.baseUrl);
    applyRecordToURLSearchParams(url.searchParams, searchParams);
    try {
      const response = await fetch(url, {
        method: "GET",
        signal: options?.signal,
        headers: this.#requestOptions.userAgent,
      });
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
  ): Promise<ReturnType<Parser["parseIdentify"]>> {
    const xml = await this.#request(
      { verb: "Identify" },
      requestOptions,
    );
    return <ReturnType<Parser["parseIdentify"]>> this.#xmlParser.parseIdentify(
      xml,
    );
  }

  async getRecord(
    identifier: string,
    metadataPrefix: string,
    requestOptions?: RequestOptions,
  ): Promise<ReturnType<Parser["parseGetRecord"]>> {
    const xml = await this.#request(
      {
        verb: "GetRecord",
        identifier,
        metadataPrefix,
      },
      requestOptions,
    );
    return <ReturnType<Parser["parseGetRecord"]>> this.#xmlParser
      .parseGetRecord(
        xml,
      );
  }

  async *#list(
    cbParseList:
      | Parser["parseListIdentifiers"]
      | Parser["parseListRecords"],
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
    let next = cbParseList.call(
      this.#xmlParser,
      xml,
    );
    yield next.records;

    while (next.resumptionToken !== null) {
      const xml = await this.#request(
        { verb, resumptionToken: next.resumptionToken },
        requestOptions,
      );
      next = cbParseList.call(
        this.#xmlParser,
        xml,
      );
      yield next.records;
    }
  }

  listIdentifiers(
    listOptions: ListOptions,
    requestOptions?: RequestOptions,
  ) {
    return <AsyncGenerator<
      ReturnType<Parser["parseListIdentifiers"]>["records"],
      void
    >> this.#list(
      this.#xmlParser.parseListIdentifiers,
      "ListIdentifiers",
      { listOptions, requestOptions },
    );
  }

  async listMetadataFormats(
    identifier?: string,
    requestOptions?: RequestOptions,
  ) {
    const xml = await this.#request(
      { verb: "ListMetadataFormats", identifier },
      requestOptions,
    );
    return <ReturnType<Parser["parseListMetadataFormats"]>> this.#xmlParser
      .parseListMetadataFormats(
        xml,
      );
  }

  listRecords(
    listOptions: ListOptions,
    requestOptions?: RequestOptions,
  ) {
    return <AsyncGenerator<
      ReturnType<Parser["parseListRecords"]>["records"],
      void
    >> this.#list(
      this.#xmlParser.parseListRecords,
      "ListRecords",
      { listOptions, requestOptions },
    );
  }

  async listSets(
    requestOptions?: RequestOptions,
  ) {
    const xml = await this.#request(
      { verb: "ListSets" },
      requestOptions,
    );
    return <ReturnType<Parser["parseListSets"]>> this.#xmlParser
      .parseListSets(
        xml,
      );
  }
}
