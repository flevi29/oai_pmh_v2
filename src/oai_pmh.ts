import { OAIPMHRequest } from "./oai_pmh_request.ts";
import { type ListResponse, OAIPMHParser } from "./parser/oai_pmh_parser.ts";
import {
  type ListOptions,
  type OAIPMHRequestConstructorOptions,
  type RequestOptions,
  type Result,
  STATUS,
} from "./model/oai_pmh.ts";
import type { OAIPMHMetadataFormat } from "./model/parser/metadata_format.ts";
import type { OAIPMHHeader } from "./model/parser/header.ts";
import type { OAIPMHRecord } from "./model/parser/record.ts";
import type { OAIPMHSet } from "./model/parser/set.ts";
import type { OAIPMHIdentify } from "./model/parser/identify.ts";

export class OAIPMH {
  readonly #request: OAIPMHRequest["request"];
  readonly #parser: OAIPMHParser;

  constructor(options: OAIPMHRequestConstructorOptions) {
    const oaiPMHParser = new OAIPMHRequest(options);
    this.#request = oaiPMHParser.request.bind(oaiPMHParser);
    this.#parser = new OAIPMHParser();
  }

  async identify(
    requestOptions?: RequestOptions,
  ): Promise<Result<OAIPMHIdentify>> {
    const result = await this.#request({ verb: "Identify" }, requestOptions);

    return result.status === STATUS.OK
      ? this.#parser.parseIdentify(...result.value)
      : result;
  }

  async getRecord(
    identifier: string,
    metadataPrefix: string,
    requestOptions?: RequestOptions,
  ): Promise<Result<OAIPMHRecord>> {
    const result = await this.#request(
      {
        verb: "GetRecord",
        identifier,
        metadataPrefix,
      },
      requestOptions,
    );

    return result.status === STATUS.OK
      ? this.#parser.parseGetRecord(...result.value)
      : result;
  }

  // @TODO: fetch combined with AbortController causes minor memory leak here
  //        but more importantly lots of annoying warnings
  //        (allegedly the leak is on all platforms)
  //        https://github.com/nodejs/undici/issues/939
  //        Potential fix for Node.js https://nodejs.org/api/util.html#utilabortedsignal-resource
  async *#list<T>(
    parseListCallback: (
      xml: string,
      response: Response,
    ) => Result<ListResponse<T>>,
    verb: string,
    requestOptions?: RequestOptions,
    listOptions?: ListOptions,
  ): AsyncGenerator<T[], Result> {
    let resumptionToken: ListResponse<unknown>["resumptionToken"] = null;
    for (;;) {
      const options = resumptionToken === null
        ? listOptions
        : { resumptionToken };

      const result = await this.#request({ verb, ...options }, requestOptions);

      if (result.status !== STATUS.OK) {
        return result;
      }

      const next = parseListCallback(...result.value);

      if (next.status !== STATUS.OK) {
        return next;
      }

      const {
        value: { records, resumptionToken: nextResumptionToken },
      } = next;

      yield records;

      resumptionToken = nextResumptionToken;
      if (resumptionToken === null) {
        return { status: STATUS.OK, value: undefined };
      }
    }
  }

  listIdentifiers(
    listOptions: ListOptions,
    requestOptions?: RequestOptions,
  ): AsyncGenerator<OAIPMHHeader[], Result> {
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
  ): Promise<Result<OAIPMHMetadataFormat[]>> {
    const result = await this.#request(
      { verb: "ListMetadataFormats", identifier },
      requestOptions,
    );

    return result.status === STATUS.OK
      ? this.#parser.parseListMetadataFormats(...result.value)
      : result;
  }

  listRecords(
    listOptions: ListOptions,
    requestOptions?: RequestOptions,
  ): AsyncGenerator<OAIPMHRecord[], Result> {
    return this.#list(
      this.#parser.parseListRecords,
      "ListRecords",
      requestOptions,
      listOptions,
    );
  }

  listSets(
    requestOptions?: RequestOptions,
  ): AsyncGenerator<OAIPMHSet[], Result> {
    return this.#list(this.#parser.parseListSets, "ListSets", requestOptions);
  }
}
