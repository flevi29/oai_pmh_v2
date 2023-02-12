import { XMLParser } from "../../deps.ts";
import { NonConformingError } from "./non_conforming_error.ts";
import { ParsedOAIPMHError } from "./parsed_oai_pmh_error.ts";
import {
  OAIBaseObj,
  OAIErrorObj,
  OAIResponse,
  OAIResumptionTokenResponse,
} from "./parser.model.ts";

export class OAIPMHParser {
  readonly #xmlParser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: false,
    trimValues: false,
    processEntities: true,
    parseTagValue: false,
  });

  #parseOaiPmhXml(xml: string): OAIBaseObj {
    const obj: OAIResponse = this.#xmlParser.parse(xml);
    const oaiResponse = obj["OAI-PMH"];
    if (typeof oaiResponse !== "object") {
      throw new NonConformingError(obj);
    }
    // https://github.com/microsoft/TypeScript/issues/44253
    if (Object.hasOwn(oaiResponse, "error")) {
      const { error: { "#text": text, "@_code": code } } =
        <OAIErrorObj> oaiResponse;
      throw new ParsedOAIPMHError(
        `OAI-PMH provider returned an error:${
          text ? `\n\ttext: ${text}` : ""
        }\n\tcode: ${code}`,
        code,
        text,
      );
    }
    return <OAIBaseObj> oaiResponse;
  }

  parseIdentify = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const identify = parsedXml.Identify;
    if (identify === undefined) {
      throw new NonConformingError(parsedXml);
    }
    return identify;
  };

  parseGetRecord = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const record = parsedXml.GetRecord;
    if (record === undefined) {
      throw new NonConformingError(parsedXml);
    }
    return record;
  };

  parseListSets = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = parsedXml.ListSets;
    if (parsedVerb === undefined) {
      throw new NonConformingError(parsedXml);
    }
    return parsedVerb.set;
  };

  parseListMetadataFormats = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = parsedXml.ListMetadataFormats;
    if (parsedVerb === undefined) {
      throw new NonConformingError(parsedXml);
    }
    return parsedVerb.metadataFormat;
  };

  #parseResumptionToken(
    parsedVerb: OAIResumptionTokenResponse,
  ): string | null {
    const { resumptionToken: rt } = parsedVerb;
    return typeof rt === "object"
      ? rt["#text"] || null
      : typeof rt === "string"
      ? rt || null
      : null;
  }

  parseListIdentifiers = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = parsedXml.ListIdentifiers;
    if (parsedVerb === undefined) {
      throw new NonConformingError(parsedXml);
    }
    return {
      records: parsedVerb.header,
      resumptionToken: this.#parseResumptionToken(parsedVerb),
    };
  };

  parseListRecords = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    const parsedVerb = parsedXml.ListRecords;
    if (parsedVerb === undefined) {
      throw new NonConformingError(parsedXml);
    }
    return {
      records: parsedVerb.record,
      resumptionToken: this.#parseResumptionToken(parsedVerb),
    };
  };
}
