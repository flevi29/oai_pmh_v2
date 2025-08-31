import { WebRequest } from "./web-request.js";
import { OAIPMHParser } from "./parser/oai-pmh-parser.js";
import type {
  ListContinuationParams,
  ListOptions,
  ListOptionsWithVerb,
  OAIPMHRequestConstructorOptions,
  ReqOpt,
} from "./model/oai-pmh.js";
import type { OAIPMHMetadataFormat } from "./model/parser/metadata_format.js";
import type { OAIPMHHeader } from "./model/parser/header.js";
import type { OAIPMHRecord } from "./model/parser/record.js";
import type { OAIPMHSet } from "./model/parser/set.js";
import type { OAIPMHIdentify } from "./model/parser/identify.js";
import type { ListResponse } from "./model/parser/shared.js";

// TODO: Rename OAIPMH to OaiPmh
export class OAIPMH {
  readonly #webRequest: WebRequest;
  readonly #parser: OAIPMHParser;

  constructor(options: OAIPMHRequestConstructorOptions) {
    this.#webRequest = new WebRequest(options);
    this.#parser = new OAIPMHParser(options.domParser ?? DOMParser);
  }

  async identify(options?: ReqOpt): Promise<OAIPMHIdentify> {
    const xml = await this.#webRequest.request({
      params: { verb: "Identify" },
      ...options,
    });
    return this.#parser.parseIdentify(xml);
  }

  async getRecord(
    identifier: string,
    metadataPrefix: string,
    options?: ReqOpt,
  ): Promise<OAIPMHRecord> {
    const xml = await this.#webRequest.request({
      params: {
        verb: "GetRecord",
        identifier,
        metadataPrefix,
      },
      ...options,
    });
    return this.#parser.parseGetRecord(xml);
  }

  // TODO: fetch combined with AbortController causes minor memory leak here
  //       but more importantly lots of annoying warnings
  //       (allegedly the leak is on all platforms)
  //       https://github.com/nodejs/undici/issues/939
  //       Potential fix for Node.js https://nodejs.org/api/util.html#utilabortedsignal-resource
  async *#list<T>(
    parseListCallback: (xml: string) => ListResponse<T>,
    listOptions: ListOptionsWithVerb,
    { init = {}, ...restOfOptions }: ReqOpt = {},
  ): AsyncGenerator<T[], void> {
    const { verb } = listOptions;

    init.keepalive = true;

    let params: ListOptionsWithVerb | ListContinuationParams = listOptions;

    for (;;) {
      const xml = await this.#webRequest.request({
        params,
        init,
        ...restOfOptions,
      });

      const { records, resumptionToken } = parseListCallback(xml);

      yield records;

      if (resumptionToken === null) {
        break;
      }

      params = { verb, resumptionToken };
    }
  }

  listIdentifiers(
    listOptions: ListOptions,
    options?: ReqOpt,
  ): AsyncGenerator<OAIPMHHeader[], void> {
    return this.#list(
      this.#parser.parseListIdentifiers,
      { verb: "ListIdentifiers", ...listOptions },
      options,
    );
  }

  async listMetadataFormats(
    identifier?: string,
    options?: ReqOpt,
  ): Promise<OAIPMHMetadataFormat[]> {
    const verb = "ListMetadataFormats",
      xml = await this.#webRequest.request({
        params: identifier === undefined ? { verb } : { verb, identifier },
        ...options,
      });
    return this.#parser.parseListMetadataFormats(xml);
  }

  listRecords(
    listOptions: ListOptions,
    options?: ReqOpt,
  ): AsyncGenerator<OAIPMHRecord[], void> {
    return this.#list(
      this.#parser.parseListRecords,
      { verb: "ListRecords", ...listOptions },
      options,
    );
  }

  listSets(options?: ReqOpt): AsyncGenerator<OAIPMHSet[], void> {
    return this.#list(
      this.#parser.parseListSets,
      { verb: "ListSets" },
      options,
    );
  }
}
