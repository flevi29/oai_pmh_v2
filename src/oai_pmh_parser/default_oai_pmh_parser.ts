import { X2jOptionsOptional, XMLParser } from "../../deps.ts";
import { OaiPmhError } from "./oai_pmh_error.ts";
import { IOaiPmhParser, TokenAndRecords } from "./oai_pmh_parser.interface.ts";
import {
  DefaultOAIReturnTypes,
  OaiObj,
  OaiResponse,
  RequiredOaiObj,
} from "./default_oai_pmh_parser.model.ts";

export class OaiPmhParser<
  TOAIReturnTypes extends DefaultOAIReturnTypes = DefaultOAIReturnTypes,
> implements IOaiPmhParser<TOAIReturnTypes> {
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

  #getNonconformingErrorMessage(object: Record<string, unknown>) {
    return `returned data does not conform to OAI-PMH\nproblematic object: ${
      JSON.stringify(object)
    }`;
  }

  #parseOaiPmhXml(xml: string): OaiObj {
    const obj: OaiResponse = this.#xmlParser.parse(xml);
    const oaiResponse = obj["OAI-PMH"];
    if (typeof oaiResponse !== "object") {
      throw new Error(this.#getNonconformingErrorMessage(oaiResponse));
    }
    if ("error" in oaiResponse) {
      const { error: { "#text": text, "@_code": code } } = oaiResponse;
      throw new OaiPmhError(
        `OAI-PMH provider returned an error:${
          text ? `\n\ttext: ${text}` : ""
        }\n\tcode: ${code}`,
        code,
        text,
      );
    }
    return oaiResponse;
  }

  #getPropertyOrThrowOnUndefined<TProperty>(
    property: TProperty,
    parentObject: OaiObj,
  ): Exclude<TProperty, undefined> {
    // This type guard does not guard
    if (property !== undefined) {
      return <Exclude<TProperty, undefined>> property;
    }
    throw new Error(this.#getNonconformingErrorMessage(parentObject));
  }

  parseIdentify(xml: string): TOAIReturnTypes["Identify"] {
    const parsedXml = this.#parseOaiPmhXml(xml);
    return <TOAIReturnTypes["Identify"]> this.#getPropertyOrThrowOnUndefined(
      parsedXml.Identify,
      parsedXml,
    );
  }

  parseGetRecord(xml: string): TOAIReturnTypes["GetRecord"] {
    const parsedXml = this.#parseOaiPmhXml(xml);
    return this.#getPropertyOrThrowOnUndefined(parsedXml.GetRecord, parsedXml);
  }

  #parseResumptionToken(
    parsedVerb:
      | RequiredOaiObj["ListIdentifiers"]
      | RequiredOaiObj["ListRecords"],
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
  ): TokenAndRecords<TOAIReturnTypes["ListIdentifiers"]> {
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
  ): TOAIReturnTypes["ListMetadataFormats"] {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = this.#getPropertyOrThrowOnUndefined(
      parsedXml.ListMetadataFormats,
      parsedXml,
    );
    return parsedVerb.metadataFormat;
  }

  parseListRecords(
    xml: string,
  ): TokenAndRecords<TOAIReturnTypes["ListRecords"]> {
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
  ): TOAIReturnTypes["ListSets"] {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = this.#getPropertyOrThrowOnUndefined(
      parsedXml.ListSets,
      parsedXml,
    );
    return parsedVerb.set;
  }
}
