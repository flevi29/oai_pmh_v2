import type {
  BaseOptions,
  ListOptions,
  OaiPmhOptionsConstructor,
  RequestOptions,
  VerbsAndFieldsForList,
} from "./model/general.ts";
import { OaiPmhError } from "./oai_pmh_error.ts";

export class OaiPmh {
  readonly #oaiPmhXML;
  readonly #requestOptions: BaseOptions;
  readonly #identifyVerbURLParams = new URLSearchParams({
    verb: "Identify",
  });

  constructor(options: OaiPmhOptionsConstructor) {
    this.#oaiPmhXML = options.xmlParser;
    new URL(options.baseUrl);
    this.#requestOptions = {
      baseUrl: options.baseUrl,
      userAgent: { "User-Agent": options.userAgent || "oai_pmh_v2" },
    };
  }

  #cleanOptionsOfUndefined(options: ListOptions) {
    for (const key of Object.keys(options)) {
      const forcedKey = <keyof ListOptions> key;
      if (options[forcedKey] === undefined) delete options[forcedKey];
    }
    return options;
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
    searchParams?: URLSearchParams,
    options?: RequestOptions,
  ): Promise<string> {
    const searchURL = new URL(this.#requestOptions.baseUrl);
    if (searchParams) searchURL.search = searchParams.toString();
    try {
      const response = await fetch(searchURL, {
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

  async getRecord(
    identifier: string,
    metadataPrefix: string,
    requestOptions?: RequestOptions,
  ) {
    const xml = await this.#request(
      new URLSearchParams({
        verb: "GetRecord",
        identifier,
        metadataPrefix,
      }),
      requestOptions,
    );
    return await this.#oaiPmhXML.parseRecord(
      this.#oaiPmhXML.parseOaiPmhXml(xml),
    );
  }

  async identify(requestOptions?: RequestOptions) {
    const xml = await this.#request(
      this.#identifyVerbURLParams,
      requestOptions,
    );
    return await this.#oaiPmhXML.parseIdentify(
      this.#oaiPmhXML.parseOaiPmhXml(xml),
    );
  }

  async listMetadataFormats(
    identifier?: string,
    requestOptions?: RequestOptions,
  ) {
    const searchParams = new URLSearchParams({
      verb: "ListMetadataFormats",
    });
    if (identifier) searchParams.set("identifier", identifier);
    const xml = await this.#request(searchParams, requestOptions);
    return await this.#oaiPmhXML.parseMetadataFormats(
      this.#oaiPmhXML.parseOaiPmhXml(xml),
    );
  }

  async *#list<T extends keyof VerbsAndFieldsForList>(
    verb: T,
    field: VerbsAndFieldsForList[T],
    options?: ListOptions,
    requestOptions?: RequestOptions,
  ) {
    const xml = await this.#request(
      new URLSearchParams({
        ...options,
        verb,
      }),
      requestOptions,
    );
    let parsedXml = this.#oaiPmhXML.parseOaiPmhXml(xml);
    yield this.#oaiPmhXML.parseList(parsedXml, verb, field);
    let resumptionToken: string | null;
    while (
      (resumptionToken = this.#oaiPmhXML.parseResumptionToken(parsedXml, verb))
    ) {
      const xml = await this.#request(
        new URLSearchParams({ verb, resumptionToken }),
        requestOptions,
      );
      parsedXml = this.#oaiPmhXML.parseOaiPmhXml(xml);
      yield this.#oaiPmhXML.parseList(parsedXml, verb, field);
    }
  }

  listIdentifiers(options: ListOptions, requestOptions?: RequestOptions) {
    return this.#list(
      "ListIdentifiers",
      "header",
      this.#cleanOptionsOfUndefined(options),
      requestOptions,
    );
  }

  listRecords(options: ListOptions, requestOptions?: RequestOptions) {
    return this.#list(
      "ListRecords",
      "record",
      this.#cleanOptionsOfUndefined(options),
      requestOptions,
    );
  }

  listSets(requestOptions?: RequestOptions) {
    return this.#list("ListSets", "set", undefined, requestOptions);
  }
}
