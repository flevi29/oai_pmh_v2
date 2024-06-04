import { OAIPMHRequest } from "./oai_pmh_request.ts";
import { OAIPMHParser } from "./parser/oai_pmh_parser.ts";
import type {
  ListOptions,
  OAIPMHRequestConstructorOptions,
} from "./model/oai_pmh.ts";
import type { OAIPMHMetadataFormat } from "./model/parser/metadata_format.ts";
import type { OAIPMHHeader } from "./model/parser/header.ts";
import type { OAIPMHRecord } from "./model/parser/record.ts";
import type { OAIPMHSet } from "./model/parser/set.ts";
import type { OAIPMHIdentify } from "./model/parser/identify.ts";
import type { ListResponse } from "./model/parser/shared.ts";

export class OAIPMH {
  readonly #request: OAIPMHRequest["request"];
  readonly #parser: OAIPMHParser;

  constructor(options: OAIPMHRequestConstructorOptions) {
    const { request } = new OAIPMHRequest(options);
    this.#request = request;

    this.#parser = new OAIPMHParser(options.domParser ?? DOMParser);
  }

  async identify(init?: RequestInit): Promise<OAIPMHIdentify> {
    const xml = await this.#request({ verb: "Identify" }, init);
    return this.#parser.parseIdentify(xml);
  }

  async getRecord(
    identifier: string,
    metadataPrefix: string,
    init?: RequestInit,
  ): Promise<OAIPMHRecord> {
    const xml = await this.#request(
      {
        verb: "GetRecord",
        identifier,
        metadataPrefix,
      },
      init,
    );
    return this.#parser.parseGetRecord(xml);
  }

  // @TODO: fetch combined with AbortController causes minor memory leak here
  //        but more importantly lots of annoying warnings
  //        (allegedly the leak is on all platforms)
  //        https://github.com/nodejs/undici/issues/939
  //        Potential fix for Node.js https://nodejs.org/api/util.html#utilabortedsignal-resource
  async *#list<T>(
    parseListCallback: (xml: string) => ListResponse<T>,
    verb: string,
    init?: RequestInit,
    listOptions?: ListOptions,
  ): AsyncGenerator<T[], void> {
    let searchParams: typeof listOptions | { resumptionToken: string } =
      listOptions;

    for (;;) {
      const xml = await this.#request(
        { verb, ...searchParams },
        { keepalive: true, ...init },
      );

      const { records, resumptionToken } = parseListCallback(xml);

      yield records;

      if (resumptionToken === null) {
        break;
      }

      searchParams = { resumptionToken };
    }
  }

  listIdentifiers(
    listOptions: ListOptions,
    init?: RequestInit,
  ): AsyncGenerator<OAIPMHHeader[], void> {
    return this.#list(
      this.#parser.parseListIdentifiers,
      "ListIdentifiers",
      init,
      listOptions,
    );
  }

  async listMetadataFormats(
    identifier?: string,
    init?: RequestInit,
  ): Promise<OAIPMHMetadataFormat[]> {
    const xml = await this.#request(
      identifier === undefined ? undefined : { identifier },
      init,
    );
    return this.#parser.parseListMetadataFormats(xml);
  }

  listRecords(
    listOptions: ListOptions,
    init?: RequestInit,
  ): AsyncGenerator<OAIPMHRecord[], void> {
    return this.#list(
      this.#parser.parseListRecords,
      "ListRecords",
      init,
      listOptions,
    );
  }

  listSets(init?: RequestInit): AsyncGenerator<OAIPMHSet[], void> {
    return this.#list(this.#parser.parseListSets, "ListSets", init);
  }
}
