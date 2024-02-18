import { XMLParser } from "../../deps.ts";
import { ValidationError } from "../error/validation_error.ts";
import { OAIPMHResponseError } from "../error/oai_pmh_response_error.ts";
import {
  type ParsedXML,
  validateAndGetParsedXML,
} from "../model/parser/parsed_xml.ts";
import { isOAIPMHBaseResponse } from "../model/parser/base_oai_pmh.ts";
import { isOAIPMHErrorResponse } from "../model/parser/error.ts";
import {
  isOAIPMHIdentifyResponse,
  type OAIPMHIdentify,
} from "../model/parser/identify.ts";
import {
  isOAIPMHGetRecordResponse,
  isOAIPMHListRecordsResponse,
  type OAIPMHRecord,
} from "../model/parser/record.ts";
import {
  isOAIPMHListIdentifiersResponse,
  type OAIPMHHeader,
} from "../model/parser/header.ts";
import {
  isOAIPMHListMetadataFormatsResponse,
  type OAIPMHMetadataFormat,
} from "../model/parser/metadata_format.ts";
import {
  isOAIPMHListSetsResponse,
  type OAIPMHSet,
} from "../model/parser/set.ts";
import type { OAIPMHResumptionToken } from "../model/parser/shared.ts";
import { type ParseResult, STATUS } from "../model/oai_pmh.ts";

export type ListResponse<T> = {
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

  #parseAndValidateOAIPMHXML(
    xml: string,
    response: Response,
  ): ParseResult<ParsedXML> {
    const fxpParsedXML = this.#xmlParser.parse(xml);
    const parsedXML = validateAndGetParsedXML(fxpParsedXML);

    if (parsedXML === undefined || !isOAIPMHBaseResponse(parsedXML)) {
      return {
        status: STATUS.VALIDATION_ERROR,
        value: new ValidationError(xml, parsedXML, response),
      };
    }

    const oaiResponse = parsedXML["OAI-PMH"][0].val;
    if (isOAIPMHErrorResponse(oaiResponse)) {
      return {
        status: STATUS.OAI_PMH_ERROR,
        value: new OAIPMHResponseError(oaiResponse, response),
      };
    }

    return { status: STATUS.OK, value: oaiResponse };
  }

  readonly parseIdentify = (
    xml: string,
    response: Response,
  ): ParseResult<OAIPMHIdentify> => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml, response);

    if (oaiResponse.status !== STATUS.OK) {
      return oaiResponse;
    }

    const { status, value } = oaiResponse;
    if (!isOAIPMHIdentifyResponse(value)) {
      return {
        status: STATUS.VALIDATION_ERROR,
        value: new ValidationError(xml, value, response),
      };
    }

    return { status, value: value.Identify[0] };
  };

  readonly parseGetRecord = (
    xml: string,
    response: Response,
  ): ParseResult<OAIPMHRecord> => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml, response);

    if (oaiResponse.status !== STATUS.OK) {
      return oaiResponse;
    }

    const { status, value } = oaiResponse;
    if (!isOAIPMHGetRecordResponse(value)) {
      return {
        status: STATUS.VALIDATION_ERROR,
        value: new ValidationError(xml, value, response),
      };
    }

    return { status, value: value.GetRecord[0].val.record[0] };
  };

  readonly parseListIdentifiers = (
    xml: string,
    response: Response,
  ): ParseResult<ListResponse<OAIPMHHeader>> => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml, response);

    if (oaiResponse.status !== STATUS.OK) {
      return oaiResponse;
    }

    const { status, value } = oaiResponse;
    if (!isOAIPMHListIdentifiersResponse(value)) {
      return {
        status: STATUS.VALIDATION_ERROR,
        value: new ValidationError(xml, value, response),
      };
    }

    const { ListIdentifiers } = value;
    return {
      status,
      value: {
        records: ListIdentifiers[0].val.header,
        resumptionToken: parseResumptionToken(ListIdentifiers),
      },
    };
  };

  readonly parseListMetadataFormats = (
    xml: string,
    response: Response,
  ): ParseResult<OAIPMHMetadataFormat[]> => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml, response);

    if (oaiResponse.status !== STATUS.OK) {
      return oaiResponse;
    }

    const { status, value } = oaiResponse;
    if (!isOAIPMHListMetadataFormatsResponse(value)) {
      return {
        status: STATUS.VALIDATION_ERROR,
        value: new ValidationError(xml, value, response),
      };
    }

    return { status, value: value.ListMetadataFormats[0].val.metadataFormat };
  };

  readonly parseListRecords = (
    xml: string,
    response: Response,
  ): ParseResult<ListResponse<OAIPMHRecord>> => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml, response);

    if (oaiResponse.status !== STATUS.OK) {
      return oaiResponse;
    }

    const { status, value } = oaiResponse;
    if (!isOAIPMHListRecordsResponse(value)) {
      return {
        status: STATUS.VALIDATION_ERROR,
        value: new ValidationError(xml, value, response),
      };
    }

    const { ListRecords } = value;
    return {
      status,
      value: {
        records: ListRecords[0].val.record,
        resumptionToken: parseResumptionToken(ListRecords),
      },
    };
  };

  readonly parseListSets = (
    xml: string,
    response: Response,
  ): ParseResult<ListResponse<OAIPMHSet>> => {
    const oaiResponse = this.#parseAndValidateOAIPMHXML(xml, response);

    if (oaiResponse.status !== STATUS.OK) {
      return oaiResponse;
    }

    const { status, value } = oaiResponse;
    if (!isOAIPMHListSetsResponse(value)) {
      return {
        status: STATUS.VALIDATION_ERROR,
        value: new ValidationError(xml, value, response),
      };
    }

    const { ListSets } = value;
    return {
      status,
      value: {
        records: ListSets[0].val?.set,
        resumptionToken: parseResumptionToken(ListSets),
      },
    };
  };
}
