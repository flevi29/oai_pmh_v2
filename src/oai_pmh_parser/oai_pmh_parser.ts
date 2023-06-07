import { XMLParser } from "../../deps.ts";
import { NonConformingError } from "./error/non_conforming_error.ts";
import { ExpectedKeyError } from "./error/expected_key_error.ts";
import { ParsedOAIPMHError } from "./error/parsed_oai_pmh_error.ts";
import {
  OAI_RESPONSE,
  OAIBaseObj,
  ResumptionTokenResponses,
} from "./parser.model.ts";

// https://github.com/microsoft/TypeScript/issues/44253
/** Extract from T those types that has K keys  */
// deno-lint-ignore no-explicit-any
type ExtractByKey<T, K extends keyof any> = T extends infer R
  ? K extends keyof R ? R
  : never
  : never;

type KeyofUnion<T> = T extends infer R ? keyof R : never;

// deno-lint-ignore no-explicit-any
function hasOwn<T extends Record<keyof any, any>, K extends keyof any>(
  o: T,
  v: K,
): o is K extends KeyofUnion<T> ? ExtractByKey<T, K>
  : T & { [P in K]: unknown } {
  return Object.hasOwn(o, v);
}

export class OAIPMHParser {
  // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/2.XMLparseOptions.md
  #xmlParser: XMLParser;

  #createParser(applyEmptyTagsFix: boolean) {
    const options: ConstructorParameters<typeof XMLParser> = [{
      alwaysCreateTextNode: true,
      ignoreDeclaration: true,
      ignoreAttributes: false,
      parseAttributeValue: false,
      trimValues: true,
      processEntities: true,
      parseTagValue: false,
    }];
    // some providers might send empty tags, which is non-compliant
    if (applyEmptyTagsFix) {
      options[0]!.updateTag = (_, jPath) => jPath.at(-1) !== "/";
    }
    return new XMLParser(...options);
  }

  constructor() {
    this.#xmlParser = this.#createParser(false);
  }

  disableEmptyTagsFix() {
    this.#xmlParser = this.#createParser(false);
  }

  enableEmptyTagsFix() {
    this.#xmlParser = this.#createParser(true);
  }

  #parseOaiPmhXml(xml: string): OAIBaseObj {
    const parsedXml = this.#xmlParser.parse(xml);
    const obj = OAI_RESPONSE.safeParse(parsedXml);
    if (!obj.success) {
      throw new NonConformingError(obj.error);
    }
    const oaiResponse = obj.data["OAI-PMH"];
    if (hasOwn(oaiResponse, "error")) {
      const { error: { "#text": text, "@_code": code } } = oaiResponse;
      throw new ParsedOAIPMHError(
        `OAI-PMH provider returned an error:${
          text !== undefined ? `\n\ttext: ${text}` : ""
        }\n\tcode: ${code}`,
        code,
        text,
      );
    }
    return oaiResponse;
  }

  parseIdentify = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    if (!hasOwn(parsedXml, "Identify")) {
      throw new NonConformingError(
        new ExpectedKeyError("Identify", parsedXml),
      );
    }
    return parsedXml.Identify;
  };

  parseGetRecord = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    if (!hasOwn(parsedXml, "GetRecord")) {
      throw new NonConformingError(
        new ExpectedKeyError("GetRecord", parsedXml),
      );
    }
    return parsedXml.GetRecord.record;
  };

  #parseResumptionToken(
    parsedVerb: ResumptionTokenResponses,
  ) {
    return parsedVerb.resumptionToken?.["#text"] ?? null;
  }

  parseListIdentifiers = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    if (!hasOwn(parsedXml, "ListIdentifiers")) {
      throw new NonConformingError(
        new ExpectedKeyError("ListIdentifiers", parsedXml),
      );
    }
    const { ListIdentifiers } = parsedXml;
    return {
      records: ListIdentifiers.header,
      resumptionToken: this.#parseResumptionToken(ListIdentifiers),
    };
  };

  parseListMetadataFormats = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    if (!hasOwn(parsedXml, "ListMetadataFormats")) {
      throw new NonConformingError(
        new ExpectedKeyError("ListMetadataFormats", parsedXml),
      );
    }
    return parsedXml.ListMetadataFormats.metadataFormat;
  };

  parseListRecords = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    if (!hasOwn(parsedXml, "ListRecords")) {
      throw new NonConformingError(
        new ExpectedKeyError("ListRecords", parsedXml),
      );
    }
    const { ListRecords } = parsedXml;
    return {
      records: ListRecords.record,
      resumptionToken: this.#parseResumptionToken(ListRecords),
    };
  };

  parseListSets = (xml: string) => {
    const parsedXml = this.#parseOaiPmhXml(xml);
    if (!hasOwn(parsedXml, "ListSets")) {
      throw new NonConformingError(
        new ExpectedKeyError("ListSets", parsedXml),
      );
    }
    const { ListSets } = parsedXml;
    return {
      records: parsedXml.ListSets.set,
      resumptionToken: this.#parseResumptionToken(ListSets),
    };
  };
}
