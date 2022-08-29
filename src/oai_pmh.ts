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
import { applyRecordToURLSearchParams } from "./util/apply_record_to_url_search_params.ts";

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

  static getNewWithDefaultParser(
    options: OaiPmhOptionsConstructor,
    defaultParserConfig?: X2jOptionsOptional,
  ) {
    const parser = new OaiPmhParser(defaultParserConfig);
    return new OaiPmh(parser, options);
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

  // Fetch API doesn't clean up it's AbortSignal listener, and there's no way for us to do it (yet)
  // So we need to create a new AbortController for each fetch request
  #getRequestOptionsWithNewSignal(
    requestOptions?: RequestOptions,
    lastCb?: () => void,
  ): { requestOptions?: RequestOptions; newCb: undefined | (() => void) } {
    if (requestOptions?.signal === undefined) {
      return { requestOptions, newCb: undefined };
    }
    const { signal } = requestOptions;
    if (lastCb !== undefined) signal.removeEventListener("abort", lastCb);
    const ac = new AbortController();
    const newCb = () => ac.abort();
    signal.addEventListener("abort", newCb);
    return {
      requestOptions: { ...requestOptions, signal: ac.signal },
      newCb,
    };
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
    let requestOpAndCb = this
      .#getRequestOptionsWithNewSignal(requestOptions);
    const xml = await this.#request(
      { ...listOptions, verb },
      requestOpAndCb.requestOptions,
    );
    let next = cbParseList.call(
      this.#xmlParser,
      xml,
    );
    yield next.records;

    while (next.resumptionToken !== null) {
      requestOpAndCb = this
        .#getRequestOptionsWithNewSignal(
          requestOptions,
          requestOpAndCb.newCb,
        );
      const xml = await this.#request(
        { verb, resumptionToken: next.resumptionToken },
        requestOpAndCb.requestOptions,
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
