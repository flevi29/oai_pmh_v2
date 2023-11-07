import { XMLParser } from "../../deps.ts";
import { ValidationError } from "./error/validation_error.ts";
import { ParsedOAIPMHError } from "./error/parsed_oai_pmh_error.ts";
import { type ParsedXML, validateAndGetParsedXML } from "./model/parsed_xml.ts";
import { isOAIPMHBaseResponse } from "./model/base_oai_pmh.ts";
import { isOAIPMHErrorResponse } from "./model/error.ts";
import {
  isOAIPMHIdentifyResponse,
  type OAIPMHIdentify,
} from "./model/identify.ts";
import {
  isOAIPMHGetRecordResponse,
  isOAIPMHListRecordsResponse,
  type OAIPMHRecord,
} from "./model/record.ts";
import {
  isOAIPMHListIdentifiersResponse,
  type OAIPMHHeader,
} from "./model/header.ts";
import {
  isOAIPMHListMetadataFormatsResponse,
  type OAIPMHMetadataFormat,
} from "./model/metadata_format.ts";
import { isOAIPMHListSetsResponse, type OAIPMHSet } from "./model/set.ts";
import type { OAIPMHResumptionToken } from "./model/shared.ts";

type ListResponse<T> = {
  records: T[];
  resumptionToken: string | null;
};

function parseResumptionToken(
  parsedVerb: [
    {
      val: { resumptionToken?: OAIPMHResumptionToken; [TKey: string]: unknown };
      [TKey: string]: unknown;
    },
  ],
): string | null {
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

  #parseAndValidateOAIPMHXML(xml: string): ParsedXML {
    const fxpParsedXML = this.#xmlParser.parse(xml);
    const parsedXML = validateAndGetParsedXML(fxpParsedXML);

    if (parsedXML === undefined || !isOAIPMHBaseResponse(parsedXML)) {
      throw new ValidationError(xml, parsedXML);
    }

    const oaiResponse = parsedXML["OAI-PMH"][0].val;
    if (isOAIPMHErrorResponse(oaiResponse)) {
      throw new ParsedOAIPMHError(oaiResponse);
    }

    return oaiResponse;
  }

  readonly parseIdentify = (xml: string): OAIPMHIdentify => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml);
    if (!isOAIPMHIdentifyResponse(oaiResponse)) {
      throw new ValidationError(xml, oaiResponse);
    }

    return oaiResponse.Identify[0];
  };

  readonly parseGetRecord = (xml: string): OAIPMHRecord => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml);
    if (!isOAIPMHGetRecordResponse(oaiResponse)) {
      throw new ValidationError(xml, oaiResponse);
    }

    return oaiResponse.GetRecord[0].val.record[0];
  };

  readonly parseListIdentifiers = (xml: string): ListResponse<OAIPMHHeader> => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml);
    if (!isOAIPMHListIdentifiersResponse(oaiResponse)) {
      throw new ValidationError(xml, oaiResponse);
    }

    const { ListIdentifiers } = oaiResponse;
    return {
      records: ListIdentifiers[0].val.header,
      resumptionToken: parseResumptionToken(ListIdentifiers),
    };
  };

  readonly parseListMetadataFormats = (xml: string): OAIPMHMetadataFormat[] => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml);
    if (!isOAIPMHListMetadataFormatsResponse(oaiResponse)) {
      throw new ValidationError(xml, oaiResponse);
    }

    return oaiResponse.ListMetadataFormats[0].val.metadataFormat;
  };

  readonly parseListRecords = (xml: string): ListResponse<OAIPMHRecord> => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml);
    if (!isOAIPMHListRecordsResponse(oaiResponse)) {
      throw new ValidationError(xml, oaiResponse);
    }

    const { ListRecords } = oaiResponse;
    return {
      records: ListRecords[0].val.record,
      resumptionToken: parseResumptionToken(ListRecords),
    };
  };

  readonly parseListSets = (xml: string): ListResponse<OAIPMHSet> => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml);
    if (!isOAIPMHListSetsResponse(oaiResponse)) {
      throw new ValidationError(xml, oaiResponse);
    }

    const { ListSets } = oaiResponse;
    return {
      records: ListSets[0].val?.set,
      resumptionToken: parseResumptionToken(ListSets),
    };
  };
}
