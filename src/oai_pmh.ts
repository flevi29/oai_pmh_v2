import { OAIPMHRequest } from "./oai_pmh_request.ts";
import { OAIPMHParser } from "./parser/oai_pmh_parser.ts";
import type {
  ListOptions,
  OAIPMHRequestConstructorOptions,
  RequestOptions,
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
    const oaiPMHParser = new OAIPMHRequest(options);
    this.#request = oaiPMHParser.request.bind(oaiPMHParser);
    this.#parser = new OAIPMHParser(options.domParser ?? DOMParser);
  }

  async identify(requestOptions?: RequestOptions): Promise<OAIPMHIdentify> {
    const result = await this.#request({ verb: "Identify" }, requestOptions);

    return this.#parser.parseIdentify(result);
  }

  async getRecord(
    identifier: string,
    metadataPrefix: string,
    requestOptions?: RequestOptions,
  ): Promise<OAIPMHRecord> {
    const result = await this.#request(
      {
        verb: "GetRecord",
        identifier,
        metadataPrefix,
      },
      requestOptions,
    );

    return this.#parser.parseGetRecord(result);
  }

  // @TODO: fetch combined with AbortController causes minor memory leak here
  //        but more importantly lots of annoying warnings
  //        (allegedly the leak is on all platforms)
  //        https://github.com/nodejs/undici/issues/939
  //        Potential fix for Node.js https://nodejs.org/api/util.html#utilabortedsignal-resource
  async *#list<T>(
    parseListCallback: (xml: string) => ListResponse<T>,
    verb: string,
    requestOptions?: RequestOptions,
    listOptions?: ListOptions,
  ): AsyncGenerator<T[], void> {
    let resumptionToken: ListResponse<T>["resumptionToken"] = null;

    for (;;) {
      const options = resumptionToken === null
        ? listOptions
        : { resumptionToken };

      const result = await this.#request({ verb, ...options }, requestOptions);

      const { records, resumptionToken: nextResumptionToken } =
        parseListCallback(result);

      yield records;

      resumptionToken = nextResumptionToken;
      if (resumptionToken === null) {
        break;
      }
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
    const result = await this.#request(
      { verb: "ListMetadataFormats", identifier },
      requestOptions,
    );

    return this.#parser.parseListMetadataFormats(result);
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
