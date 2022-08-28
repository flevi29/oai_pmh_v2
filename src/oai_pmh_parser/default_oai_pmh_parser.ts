import { X2jOptionsOptional, XMLParser } from "../../deps.ts";
import {
  OaiPmhParserInterface,
  TokenAndRecords,
} from "./oai_pmh_parser.interface.ts";
import {
  NonUndefined,
  OaiObj,
  OaiResponse,
  RequiredOaiObj,
} from "./default_oai_pmh_parser.model.ts";
import { OaiPmhError } from "../errors/oai_pmh_error.ts";

export class OaiPmhParser implements
  OaiPmhParserInterface<
    RequiredOaiObj["Identify"],
    RequiredOaiObj["GetRecord"],
    TokenAndRecords<RequiredOaiObj["ListIdentifiers"]["header"]>,
    TokenAndRecords<RequiredOaiObj["ListMetadataFormats"]["metadataFormat"]>,
    TokenAndRecords<RequiredOaiObj["ListRecords"]["record"]>,
    TokenAndRecords<RequiredOaiObj["ListSets"]["set"]>
  > {
  readonly #xmlParser;

  constructor(
    parserOptions: X2jOptionsOptional = {
      ignoreAttributes: false,
      parseAttributeValue: false,
      trimValues: true,
      processEntities: true,
      parseTagValue: false,
    },
  ) {
    this.#xmlParser = new XMLParser(parserOptions);
  }

  #parseOaiPmhXml(xml: string): OaiObj {
    const obj: OaiResponse = this.#xmlParser.parse(xml);
    const oaiResponse = obj["OAI-PMH"];
    if (typeof oaiResponse !== "object") {
      throw new OaiPmhError("Returned data does not conform to OAI-PMH");
    }
    if ("error" in oaiResponse) {
      const { error: { "#text": text, "@_code": code } } = oaiResponse;
      throw new OaiPmhError(
        `OAI-PMH provider returned an error:\n\ttext: ${text}\n\tcode: ${code}`,
      );
    }
    return oaiResponse;
  }

  #getNonComformantErrorMessage(object: Record<string, unknown>) {
    return `Returned data does not conform to OAI-PMH\nProblematic object: ${
      JSON.stringify(object)
    }`;
  }

  #getPropertyOrThrowOnUndefined<T extends OaiObj[keyof OaiObj]>(
    property: T,
    parentObject: OaiObj,
  ): NonUndefined<T> {
    // for whatever reason this type guard does not work
    if (property === undefined) {
      throw new OaiPmhError(this.#getNonComformantErrorMessage(parentObject));
    }
    return <NonUndefined<T>> property;
  }

  parseIdentify(xml: string): RequiredOaiObj["Identify"] {
    const parsedXml = this.#parseOaiPmhXml(xml);
    return this.#getPropertyOrThrowOnUndefined(parsedXml.Identify, parsedXml);
  }

  parseGetRecord(xml: string): RequiredOaiObj["GetRecord"] {
    const parsedXml = this.#parseOaiPmhXml(xml);
    return this.#getPropertyOrThrowOnUndefined(parsedXml.GetRecord, parsedXml);
  }

  #parseResumptionToken(
    parsedVerb:
      | RequiredOaiObj["ListIdentifiers"]
      | RequiredOaiObj["ListMetadataFormats"]
      | RequiredOaiObj["ListRecords"]
      | RequiredOaiObj["ListSets"],
  ): string | null {
    const { resumptionToken: rt } = parsedVerb;
    return typeof rt === "object"
      ? rt["#text"] ?? null
      : typeof rt === "string"
      ? rt
      : null;
  }

  parseListIdentifiers(
    xml: string,
  ): TokenAndRecords<RequiredOaiObj["ListIdentifiers"]["header"]> {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = this.#getPropertyOrThrowOnUndefined(
      parsedXml.ListIdentifiers,
      parsedXml,
    );
    return {
      records: parsedVerb.header,
      resumptionToken: this.#parseResumptionToken(parsedVerb),
    };
  }

  parseListMetadataFormats(
    xml: string,
  ): TokenAndRecords<RequiredOaiObj["ListMetadataFormats"]["metadataFormat"]> {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = this.#getPropertyOrThrowOnUndefined(
      parsedXml.ListMetadataFormats,
      parsedXml,
    );
    return {
      records: parsedVerb.metadataFormat,
      resumptionToken: this.#parseResumptionToken(parsedVerb),
    };
  }

  parseListRecords(
    xml: string,
  ): TokenAndRecords<RequiredOaiObj["ListRecords"]["record"]> {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = this.#getPropertyOrThrowOnUndefined(
      parsedXml.ListRecords,
      parsedXml,
    );
    return {
      records: parsedVerb.record,
      resumptionToken: this.#parseResumptionToken(parsedVerb),
    };
  }

  parseListSets(
    xml: string,
  ): TokenAndRecords<RequiredOaiObj["ListSets"]["set"]> {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = this.#getPropertyOrThrowOnUndefined(
      parsedXml.ListSets,
      parsedXml,
    );
    return {
      records: parsedVerb.set,
      resumptionToken: this.#parseResumptionToken(parsedVerb),
    };
  }
}
