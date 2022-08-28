import { X2jOptionsOptional } from "../deps.ts";
import { OaiPmhParser } from "./oai_pmh_parser/default_oai_pmh_parser.ts";
import type {
  BaseOptions,
  ListOptions,
  OaiPmhOptionsConstructor,
  RequestOptions,
} from "./oai_pmh.model.ts";
import { OaiPmhParserInterface } from "./oai_pmh_parser/oai_pmh_parser.interface.ts";
import { OaiPmhError } from "./errors/oai_pmh_error.ts";
import { recordToUrlSearchParams } from "./util/record_to_url_search_params.ts";

export class OaiPmh<Parser extends OaiPmhParserInterface> {
  readonly #xmlParser: Parser;
  readonly #requestOptions: BaseOptions;

  constructor(xmlParser: Parser, options: OaiPmhOptionsConstructor) {
    this.#xmlParser = xmlParser;
    this.#requestOptions = {
      baseUrl: new URL(options.baseUrl),
      userAgent: { "User-Agent": options.userAgent || "oai_pmh_v2" },
    };
  }

  static getNewWithDefaultParser(
    options: OaiPmhOptionsConstructor,
    defaultParserConfig?: X2jOptionsOptional,
  ) {
    const xmlParser = new OaiPmhParser(defaultParserConfig);
    return new OaiPmh(xmlParser, options);
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
    searchParams: URLSearchParams,
    options?: RequestOptions,
  ): Promise<string> {
    const url = new URL(this.#requestOptions.baseUrl);
    url.search = searchParams.toString();
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
        err.httpStatus !== undefined &&
        err.httpStatus >= 500 && options?.retry !== undefined
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

  readonly #identifyVerbURLParams = new URLSearchParams({
    verb: "Identify",
  });

  async identify(
    requestOptions?: RequestOptions,
  ): Promise<ReturnType<Parser["parseIdentify"]>> {
    const xml = await this.#request(
      this.#identifyVerbURLParams,
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
      new URLSearchParams({
        verb: "GetRecord",
        identifier,
        metadataPrefix,
      }),
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
      | Parser["parseListMetadataFormats"]
      | Parser["parseListRecords"]
      | Parser["parseListSets"],
    verb:
      | "ListIdentifiers"
      | "ListMetadataFormats"
      | "ListRecords"
      | "ListSets",
    options: {
      listOptions?: ListOptions;
      requestOptions?: RequestOptions;
    },
  ) {
    const { listOptions, requestOptions } = options;
    const initialParams = recordToUrlSearchParams({
      ...listOptions,
      verb,
    });
    const xml = await this.#request(initialParams, requestOptions);
    let next = cbParseList.call(
      this.#xmlParser,
      xml,
    );
    yield next.records;
    const params = new URLSearchParams({ verb });
    while (next.resumptionToken !== null) {
      params.set("resumptionToken", next.resumptionToken);
      const xml = await this.#request(
        params,
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
    options: { listOptions: ListOptions; requestOptions?: RequestOptions },
  ) {
    const { listOptions, requestOptions } = options;
    return <AsyncGenerator<
      ReturnType<Parser["parseListIdentifiers"]>["records"],
      void
    >> this.#list(
      this.#xmlParser.parseListIdentifiers,
      "ListIdentifiers",
      { listOptions, requestOptions },
    );
  }

  listMetadataFormats(options?: {
    identifier?: string;
    requestOptions?: RequestOptions;
  }) {
    return <AsyncGenerator<
      ReturnType<Parser["parseListMetadataFormats"]>["records"],
      void
    >> this.#list(
      this.#xmlParser.parseListMetadataFormats,
      "ListMetadataFormats",
      {
        listOptions: { identifier: options?.identifier },
        requestOptions: options?.requestOptions,
      },
    );
  }

  listRecords(
    options: { listOptions: ListOptions; requestOptions?: RequestOptions },
  ) {
    return <AsyncGenerator<
      ReturnType<Parser["parseListRecords"]>["records"],
      void
    >> this.#list(
      this.#xmlParser.parseListRecords,
      "ListRecords",
      options,
    );
  }

  listSets(
    options?: { requestOptions?: RequestOptions },
  ) {
    return <AsyncGenerator<
      ReturnType<Parser["parseListSets"]>["records"],
      void
    >> this.#list(
      this.#xmlParser.parseListSets,
      "ListSets",
      {
        requestOptions: options?.requestOptions,
      },
    );
  }
}
