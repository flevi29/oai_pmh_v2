import { XMLParser } from "../../deps.ts";
import { NonConformingError } from "./error/non_conforming_error.ts";
import { ExpectedKeyError } from "./error/expected_key_error.ts";
import { ParsedOAIPMHError } from "./error/parsed_oai_pmh_error.ts";
import { validateAndTransform } from "./model/transform.ts";
import { ResumptionTokenResponse } from "./model/oai.ts";

// https://github.com/microsoft/TypeScript/issues/44253
/** Extract from T those types that has K keys  */
// deno-lint-ignore no-explicit-any
type ExtractByKey<T, K extends keyof any> = T extends infer R
  ? K extends keyof R ? R
  : never
  : never;

type KeyofUnion<T> = T extends infer R ? keyof R : never;

// @TODO: Make this type apply globally rather than from a function, and make sure the
//        type is not included in
// deno-lint-ignore no-explicit-any
function hasOwn<T extends Record<keyof any, any>, K extends keyof any>(
  o: T,
  v: K,
): o is K extends KeyofUnion<T> ? ExtractByKey<T, K>
  : T & { [P in K]: unknown } {
  return Object.hasOwn(o, v);
}

function parseResumptionToken(parsedVerb: ResumptionTokenResponse) {
  return parsedVerb[0].val?.resumptionToken?.[0].val ?? null;
}

export class OAIPMHParser {
  // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/2.XMLparseOptions.md
  readonly #xmlParser = new XMLParser({
    preserveOrder: true,
    ignoreDeclaration: true,
    ignoreAttributes: false,
    parseTagValue: false,
  });

  #parseOAIPMHXML(xml: string) {
    const parsedXML = this.#xmlParser.parse(xml);
    const validatedAndTransformedXML = validateAndTransform(parsedXML);
    const oaiResponse = validatedAndTransformedXML["OAI-PMH"][0].val;
    if (hasOwn(oaiResponse, "error")) {
      throw new ParsedOAIPMHError(oaiResponse.error);
    }
    return oaiResponse;
  }

  parseIdentify = (xml: string) => {
    const parsedXML = this.#parseOAIPMHXML(xml);
    if (!hasOwn(parsedXML, "Identify")) {
      throw new NonConformingError(new ExpectedKeyError("Identify", parsedXML));
    }
    return parsedXML.Identify[0];
  };

  parseGetRecord = (xml: string) => {
    const parsedXML = this.#parseOAIPMHXML(xml);
    if (!hasOwn(parsedXML, "GetRecord")) {
      throw new NonConformingError(
        new ExpectedKeyError("GetRecord", parsedXML),
      );
    }
    return parsedXML.GetRecord[0].val.record[0];
  };

  parseListIdentifiers = (xml: string) => {
    const parsedXML = this.#parseOAIPMHXML(xml);
    if (!hasOwn(parsedXML, "ListIdentifiers")) {
      throw new NonConformingError(
        new ExpectedKeyError("ListIdentifiers", parsedXML),
      );
    }
    const { ListIdentifiers } = parsedXML;
    return {
      records: ListIdentifiers[0].val.header,
      resumptionToken: parseResumptionToken(ListIdentifiers),
    };
  };

  parseListMetadataFormats = (xml: string) => {
    const parsedXML = this.#parseOAIPMHXML(xml);
    if (!hasOwn(parsedXML, "ListMetadataFormats")) {
      throw new NonConformingError(
        new ExpectedKeyError("ListMetadataFormats", parsedXML),
      );
    }
    return parsedXML.ListMetadataFormats[0].val.metadataFormat;
  };

  parseListRecords = (xml: string) => {
    const parsedXML = this.#parseOAIPMHXML(xml);
    if (!hasOwn(parsedXML, "ListRecords")) {
      throw new NonConformingError(
        new ExpectedKeyError("ListRecords", parsedXML),
      );
    }
    const { ListRecords } = parsedXML;
    return {
      records: ListRecords[0].val.record,
      resumptionToken: parseResumptionToken(ListRecords),
    };
  };

  parseListSets = (xml: string) => {
    const parsedXML = this.#parseOAIPMHXML(xml);
    if (!hasOwn(parsedXML, "ListSets")) {
      throw new NonConformingError(new ExpectedKeyError("ListSets", parsedXML));
    }
    const { ListSets } = parsedXML;
    return {
      records: ListSets[0].val?.set,
      resumptionToken: parseResumptionToken(ListSets),
    };
  };
}
