import { OAIPMHRequest } from "./oai_pmh_request.ts";
import { OAIPMHError } from "./oai_pmh_error.ts";
import { OAIPMHParser } from "./oai_pmh_parser/oai_pmh_parser.ts";
import type {
  ListOptions,
  OAIPMHRequestConstructorOptions,
  RequestOptions,
} from "./oai_pmh.model.ts";
import type { OAIPMHMetadataFormat } from "./oai_pmh_parser/model/metadata_format.ts";
import type { OAIPMHHeader } from "./oai_pmh_parser/model/header.ts";
import type { OAIPMHRecord } from "./oai_pmh_parser/model/record.ts";
import type { OAIPMHSet } from "./oai_pmh_parser/model/set.ts";
import type { OAIPMHIdentify } from "./oai_pmh_parser/model/identify.ts";

export class OAIPMH {
  readonly #request: OAIPMHRequest["request"];
  readonly #parser: OAIPMHParser;

  constructor(options: OAIPMHRequestConstructorOptions) {
    this.#request = new OAIPMHRequest(options).request;
    this.#parser = new OAIPMHParser();
  }

  // deno-lint-ignore no-explicit-any
  #callFnAndWrapError<TParserFn extends (xml: string) => any>(
    parserFn: TParserFn,
    xml: string,
    response: Response,
  ): ReturnType<TParserFn> {
    try {
      return parserFn(xml);
    } catch (error: unknown) {
      throw new OAIPMHError(
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : JSON.stringify(error),
        { response, cause: error },
      );
    }
  }

  async identify(requestOptions?: RequestOptions): Promise<OAIPMHIdentify> {
    const res = await this.#request({ verb: "Identify" }, requestOptions);

    return this.#callFnAndWrapError(this.#parser.parseIdentify, ...res);
  }

  async getRecord(
    identifier: string,
    metadataPrefix: string,
    requestOptions?: RequestOptions,
  ): Promise<OAIPMHRecord> {
    const res = await this.#request(
      {
        verb: "GetRecord",
        identifier,
        metadataPrefix,
      },
      requestOptions,
    );

    return this.#callFnAndWrapError(this.#parser.parseGetRecord, ...res);
  }

  // @TODO: fetch combined with AbortController causes minor memory leak here
  //        but more importantly lots of annoying warnings
  //        (allegedly the leak is on all platforms)
  //        https://github.com/nodejs/undici/issues/939
  //        Potential fix for Node.js https://nodejs.org/api/util.html#utilabortedsignal-resource
  async *#list<
    TCB extends OAIPMHParser[
      | "parseListSets"
      | "parseListIdentifiers"
      | "parseListRecords"
    ],
    TReturn = ReturnType<TCB>["records"],
  >(
    parseListCallback: TCB,
    verb: "ListSets" | "ListIdentifiers" | "ListRecords",
    requestOptions?: RequestOptions,
    listOptions?: ListOptions,
  ): AsyncGenerator<TReturn, void> {
    const resp = await this.#request({ ...listOptions, verb }, requestOptions);
    let next = this.#callFnAndWrapError(parseListCallback, ...resp);

    yield next.records as TReturn;

    while (next.resumptionToken !== null) {
      const resp = await this.#request(
        { verb, resumptionToken: next.resumptionToken },
        requestOptions,
      );
      next = this.#callFnAndWrapError(parseListCallback, ...resp);

      yield next.records as TReturn;
    }
  }

  listIdentifiers(
    listOptions: ListOptions,
    requestOptions?: RequestOptions,
  ): AsyncGenerator<OAIPMHHeader[], void> {
    return this.#list(
      this.#parser.parseListIdentifiers,
      "ListIdentifiers",
      requestOptions,
      listOptions,
    );
  }

  async listMetadataFormats(
    identifier?: string,
    requestOptions?: RequestOptions,
  ): Promise<OAIPMHMetadataFormat[]> {
    const res = await this.#request(
      { verb: "ListMetadataFormats", identifier },
      requestOptions,
    );

    return this.#callFnAndWrapError(
      this.#parser.parseListMetadataFormats,
      ...res,
    );
  }

  listRecords(
    listOptions: ListOptions,
    requestOptions?: RequestOptions,
  ): AsyncGenerator<OAIPMHRecord[], void> {
    return this.#list(
      this.#parser.parseListRecords,
      "ListRecords",
      requestOptions,
      listOptions,
    );
  }

  listSets(requestOptions?: RequestOptions): AsyncGenerator<OAIPMHSet[], void> {
    return this.#list(this.#parser.parseListSets, "ListSets", requestOptions);
  }
}
