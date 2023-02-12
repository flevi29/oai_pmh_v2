import { OAIPMHError } from "./oai_pmh_error.ts";
import { getURLWithParameters } from "./url_search_params.ts";
import { OAIPMHParser } from "./oai_pmh_parser/oai_pmh_parser.ts";
import {
  ListOptions,
  OAIPMHOptionsConstructor,
  RequestOptions,
} from "./oai_pmh.model.ts";
import { MaybeArr, OAIRecord } from "./oai_pmh_parser/parser.model.ts";

export class OAIPMH {
  readonly #baseURL: string;
  readonly #userAgent: { "User-Agent": string };
  readonly #debugLogRetries: boolean;
  readonly #parser: OAIPMHParser;

  #coerceAndCheckURL(url: URL | string) {
    if (typeof url === "string") {
      // check if it's a valid URL
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
    this.#userAgent = { "User-Agent": userAgent || "oai_pmh_v2" };
    this.#debugLogRetries = options?.debugLogRetries ?? false;

    this.#parser = new OAIPMHParser();
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
      throw new OAIPMHError(errorMessage, { response });
    }
  }

  async #request(
    searchParams: Record<string, string | undefined>,
    options?: RequestOptions,
  ): Promise<[xml: string, response: Response]> {
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
      return this.#request(searchParams, {
        ...options,
        retry: retry - 1,
      });
    }
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
      MaybeArr<OAIRecord<TReturn>>
    >(this.#parser.parseListRecords, "ListRecords", {
      listOptions,
      requestOptions,
    });
  }
}
