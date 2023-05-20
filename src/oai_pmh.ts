import { OAIRequest } from "./oai_request.ts";
import { OAIPMHError } from "./oai_pmh_error.ts";
import { OAIPMHParser } from "./oai_pmh_parser/oai_pmh_parser.ts";
import { ListOptions, RequestOptions } from "./oai_pmh.model.ts";
import { OAIMaybeArrRecord, OAIRecord } from "./oai_pmh_parser/parser.model.ts";

export class OAIPMH {
  readonly #request: OAIRequest["request"];
  readonly #parser: OAIPMHParser;

  constructor(...oaiRequestOptions: ConstructorParameters<typeof OAIRequest>) {
    const oaiRequest = new OAIRequest(...oaiRequestOptions);
    this.#request = oaiRequest.request.bind(oaiRequest);
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
        typeof error === "object" && error !== null &&
          Object.hasOwn(error, "message")
          // https://github.com/microsoft/TypeScript/issues/44253
          // deno-lint-ignore no-explicit-any
          ? (<any> error).message
          : error,
        { response, cause: error },
      );
    }
  }

  async identify(requestOptions?: RequestOptions) {
    const res = await this.#request({ verb: "Identify" }, requestOptions);
    return this.#callFnAndWrapError(this.#parser.parseIdentify, ...res);
  }

  async getRecord<TReturn = unknown>(
    identifier: string,
    metadataPrefix: string,
    requestOptions?: RequestOptions,
  ) {
    const res = await this.#request({
      verb: "GetRecord",
      identifier,
      metadataPrefix,
    }, requestOptions);
    return <OAIRecord<TReturn>> this.#callFnAndWrapError(
      this.#parser.parseGetRecord,
      ...res,
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

  async listSets(requestOptions?: RequestOptions) {
    const res = await this.#request({ verb: "ListSets" }, requestOptions);
    return this.#callFnAndWrapError(this.#parser.parseListSets, ...res);
  }

  // @TODO: fetch combined with AbortController causes memory leak here
  // https://github.com/nodejs/undici/issues/939
  async *#list<
    TCB extends OAIPMHParser["parseListIdentifiers" | "parseListRecords"],
    TReturn = ReturnType<TCB>["records"],
  >(
    parseListCallback: TCB,
    verb: "ListIdentifiers" | "ListRecords",
    options: { listOptions: ListOptions; requestOptions?: RequestOptions },
  ) {
    const { listOptions, requestOptions } = options;
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
    return this.#list<OAIPMHParser["parseListIdentifiers"]>(
      this.#parser.parseListIdentifiers,
      "ListIdentifiers",
      { listOptions, requestOptions },
    );
  }

  listRecords<TReturn = unknown>(
    listOptions: ListOptions,
    requestOptions?: RequestOptions,
  ) {
    return this.#list<
      OAIPMHParser["parseListRecords"],
      OAIMaybeArrRecord<TReturn>
    >(this.#parser.parseListRecords, "ListRecords", {
      listOptions,
      requestOptions,
    });
  }
}
