import { X2jOptionsOptional, XMLParser } from "../../deps.ts";
import { OAIPMHError } from "./oai_pmh_error.ts";
import { IOAIPMHParser, TokenAndRecords } from "./oai_pmh_parser.interface.ts";
import {
  OAIBaseObj,
  OAIMethodTypesDefault,
  OAIMethodTypesFinalType,
  OAIMethodTypesToExtend,
  OAIResponse,
  ResumptionTokenObj,
} from "./parser.model.ts";

export class OAIPMHParser<
  TOAIReturnTypes extends OAIMethodTypesToExtend = OAIMethodTypesDefault,
> implements IOAIPMHParser<TOAIReturnTypes> {
  readonly #xmlParser: XMLParser;

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

  #getNonconformingError(object: Record<string, unknown>) {
    return new Error(
      `returned data does not conform to OAI-PMH:\n${JSON.stringify(object)}`,
    );
  }

  #parseOaiPmhXml(xml: string): OAIBaseObj {
    const obj: OAIResponse = this.#xmlParser.parse(xml);
    const oaiResponse = obj["OAI-PMH"];
    if (typeof oaiResponse !== "object") {
      throw this.#getNonconformingError(oaiResponse);
    }
    if ("error" in oaiResponse) {
      const { error: { "#text": text, "@_code": code } } = oaiResponse;
      throw new OAIPMHError(
        `OAI-PMH provider returned an error:${
          text ? `\n\ttext: ${text}` : ""
        }\n\tcode: ${code}`,
        code,
        text,
      );
    }
    return oaiResponse;
  }

  parseIdentify<
    TIdentify
      extends (undefined extends TOAIReturnTypes["Identify"]
        ? OAIMethodTypesFinalType["Identify"]
        : TOAIReturnTypes["Identify"]),
  >(xml: string) {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const identify = parsedXml.Identify;
    if (identify === undefined) {
      throw this.#getNonconformingError(parsedXml);
    }
    return <TIdentify> identify;
  }

  parseGetRecord<
    TGetRecord
      extends (undefined extends TOAIReturnTypes["GetRecord"]
        ? OAIMethodTypesFinalType["GetRecord"]
        : TOAIReturnTypes["GetRecord"]),
  >(xml: string) {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const record = parsedXml.GetRecord;
    if (record === undefined) {
      throw this.#getNonconformingError(parsedXml);
    }
    return <TGetRecord> record;
  }

  #parseResumptionToken<TVerb extends ResumptionTokenObj>(
    parsedVerb: TVerb,
  ): string | null {
    const { resumptionToken: rt } = parsedVerb;
    return typeof rt === "object"
      ? rt["#text"] || null
      : typeof rt === "string"
      ? rt
      : null;
  }

  parseListIdentifiers<
    TListIdentifiers
      extends (undefined extends TOAIReturnTypes["ListIdentifiers"]
        ? OAIMethodTypesFinalType["ListIdentifiers"]
        : TOAIReturnTypes["ListIdentifiers"]),
  >(xml: string) {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = parsedXml.ListIdentifiers;
    if (parsedVerb === undefined) {
      throw this.#getNonconformingError(parsedXml);
    }
    return <TokenAndRecords<TListIdentifiers>> {
      records: parsedVerb.header,
      resumptionToken: this.#parseResumptionToken(parsedVerb),
    };
  }

  parseListMetadataFormats<
    TListMetadataFormats
      extends (undefined extends TOAIReturnTypes["ListMetadataFormats"]
        ? OAIMethodTypesFinalType["ListMetadataFormats"]
        : TOAIReturnTypes["ListMetadataFormats"]),
  >(xml: string) {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = parsedXml.ListMetadataFormats;
    if (parsedVerb === undefined) {
      throw this.#getNonconformingError(parsedXml);
    }
    return <TListMetadataFormats> parsedVerb.metadataFormat;
  }

  parseListRecords<
    TListRecords
      extends (undefined extends TOAIReturnTypes["ListRecords"]
        ? OAIMethodTypesFinalType["ListRecords"]
        : TOAIReturnTypes["ListRecords"]),
  >(xml: string) {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = parsedXml.ListRecords;
    if (parsedVerb === undefined) {
      throw this.#getNonconformingError(parsedXml);
    }
    return <TokenAndRecords<TListRecords>> {
      records: parsedVerb.record,
      resumptionToken: this.#parseResumptionToken(parsedVerb),
    };
  }

  parseListSets<
    TListSets
      extends (undefined extends TOAIReturnTypes["ListSets"]
        ? OAIMethodTypesFinalType["ListSets"]
        : TOAIReturnTypes["ListSets"]),
  >(xml: string) {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = parsedXml.ListSets;
    if (parsedVerb === undefined) {
      throw this.#getNonconformingError(parsedXml);
    }
    return <TListSets> parsedVerb.set;
  }
}
