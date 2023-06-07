import { OAIRequest } from "./oai_request.ts";
import { OAIPMHError } from "./oai_pmh_error.ts";
import { OAIPMHParser } from "./oai_pmh_parser/oai_pmh_parser.ts";
import { ListOptions, RequestOptions } from "./oai_pmh.model.ts";

export class OAIPMH {
  readonly #request: OAIRequest["request"];
  readonly #parser: OAIPMHParser;

  constructor(...requestOptions: ConstructorParameters<typeof OAIRequest>) {
    this.#request = new OAIRequest(...requestOptions).request;
    this.#parser = new OAIPMHParser();
  }

  disableEmptyTagsFix() {
    this.#parser.disableEmptyTagsFix();
  }

  enableEmptyTagsFix() {
    this.#parser.enableEmptyTagsFix();
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
        typeof error === "string" ? error : JSON.stringify(error),
        { response, cause: error },
      );
    }
  }

  async identify(requestOptions?: RequestOptions) {
    const res = await this.#request({ verb: "Identify" }, requestOptions);
    return this.#callFnAndWrapError(this.#parser.parseIdentify, ...res);
  }

  async getRecord(
    identifier: string,
    metadataPrefix: string,
    requestOptions?: RequestOptions,
  ) {
    const res = await this.#request({
      verb: "GetRecord",
      identifier,
      metadataPrefix,
    }, requestOptions);
    return this.#callFnAndWrapError(
      this.#parser.parseGetRecord,
      ...res,
    );
  }

  // @TODO: fetch combined with AbortController causes memory leak here
  // (apparently on all platforms, fetch API issue)
  // https://github.com/nodejs/undici/issues/939
  async *#list<
    TCB extends OAIPMHParser[
      "parseListSets" | "parseListIdentifiers" | "parseListRecords"
    ],
    TReturn = ReturnType<TCB>["records"],
  >(
    parseListCallback: TCB,
    verb: "ListSets" | "ListIdentifiers" | "ListRecords",
    requestOptions?: RequestOptions,
    listOptions?: ListOptions,
  ) {
    const resp = await this.#request(
      { ...listOptions, verb },
      requestOptions,
    );
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

  listIdentifiers(listOptions: ListOptions, requestOptions?: RequestOptions) {
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
  ) {
    const res = await this.#request(
      { verb: "ListMetadataFormats", identifier },
      requestOptions,
    );
    return this.#callFnAndWrapError(
      this.#parser.parseListMetadataFormats,
      ...res,
    );
  }

  listRecords(listOptions: ListOptions, requestOptions?: RequestOptions) {
    return this.#list(
      this.#parser.parseListRecords,
      "ListRecords",
      requestOptions,
      listOptions,
    );
  }

  listSets(requestOptions?: RequestOptions) {
    return this.#list(this.#parser.parseListSets, "ListSets", requestOptions);
  }
}
