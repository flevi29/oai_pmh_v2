import { XMLParser } from "./xml_parser.ts";
import {
  InnerValidationError,
  ValidationError,
} from "../error/validation_error.ts";
import { OAIPMHResponseError } from "../error/oai_pmh_response_error.ts";
import {
  type ParsedXML,
  validateAndGetParsedXML,
} from "../model/parser/parsed_xml.ts";
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
  type OAIPMHMetadataFormat,
  validateOAIPMHListMetadataFormatsResponse,
} from "../model/parser/metadata_format.ts";
import {
  isOAIPMHListSetsResponse,
  type OAIPMHSet,
} from "../model/parser/set.ts";
import type { OAIPMHResumptionToken } from "../model/parser/shared.ts";

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

function validationErrorWrap<TReturn>(
  xml: string,
  xmlParser: XMLParser,
  callback: (childNodes: NodeListOf<ChildNode>) => TReturn,
): NoInfer<TReturn> {
  const { childNodes } = xmlParser.parse(xml);

  try {
    return callback(childNodes);
  } catch (error: unknown) {
    if (error instanceof InnerValidationError) {
      throw new ValidationError(error, xml);
    }

    throw error;
  }
}

export class OAIPMHParser {
  readonly #xmlParser: XMLParser;

  constructor(domParser: typeof DOMParser) {
    this.#xmlParser = new XMLParser(domParser);
  }

  readonly parseIdentify = (xml: string): OAIPMHIdentify => {
    throw new Error("unimplemented");
    // const oaiResponse = this.#parseAndValidateOAIPMHXML(xml, response);

    // if (oaiResponse.status !== STATUS.OK) {
    //   return oaiResponse;
    // }

    // const { status, value } = oaiResponse;
    // if (!isOAIPMHIdentifyResponse(value)) {
    //   return {
    //     status: STATUS.VALIDATION_ERROR,
    //     value: new ValidationError(xml, value, response),
    //   };
    // }

    // return { status, value: value.Identify[0] };
  };

  readonly parseGetRecord = (xml: string): OAIPMHRecord => {
    throw new Error("unimplemented");
    // const oaiResponse = this.#parseAndValidateOAIPMHXML(xml, response);

    // if (oaiResponse.status !== STATUS.OK) {
    //   return oaiResponse;
    // }

    // const { status, value } = oaiResponse;
    // if (!isOAIPMHGetRecordResponse(value)) {
    //   return {
    //     status: STATUS.VALIDATION_ERROR,
    //     value: new ValidationError(xml, value, response),
    //   };
    // }

    // return { status, value: value.GetRecord[0].val.record[0] };
  };

  readonly parseListIdentifiers = (xml: string): ListResponse<OAIPMHHeader> => {
    throw new Error("unimplemented");
    // const oaiResponse = this.#parseAndValidateOAIPMHXML(xml, response);

    // if (oaiResponse.status !== STATUS.OK) {
    //   return oaiResponse;
    // }

    // const { status, value } = oaiResponse;
    // if (!isOAIPMHListIdentifiersResponse(value)) {
    //   return {
    //     status: STATUS.VALIDATION_ERROR,
    //     value: new ValidationError(xml, value, response),
    //   };
    // }

    // const { ListIdentifiers } = value;
    // return {
    //   status,
    //   value: {
    //     records: ListIdentifiers[0].val.header,
    //     resumptionToken: parseResumptionToken(ListIdentifiers),
    //   },
    // };
  };

  readonly parseListMetadataFormats = (xml: string): OAIPMHMetadataFormat[] => {
    return validationErrorWrap(
      xml,
      this.#xmlParser,
      validateOAIPMHListMetadataFormatsResponse,
    );
  };

  readonly parseListRecords = (xml: string): ListResponse<OAIPMHRecord> => {
    throw new Error("unimplemented");
    // const oaiResponse = this.#parseAndValidateOAIPMHXML(xml, response);

    // if (oaiResponse.status !== STATUS.OK) {
    //   return oaiResponse;
    // }

    // const { status, value } = oaiResponse;
    // if (!isOAIPMHListRecordsResponse(value)) {
    //   return {
    //     status: STATUS.VALIDATION_ERROR,
    //     value: new ValidationError(xml, value, response),
    //   };
    // }

    // const { ListRecords } = value;
    // return {
    //   status,
    //   value: {
    //     records: ListRecords[0].val.record,
    //     resumptionToken: parseResumptionToken(ListRecords),
    //   },
    // };
  };

  readonly parseListSets = (xml: string): ListResponse<OAIPMHSet> => {
    throw new Error("unimplemented");
    // const oaiResponse = this.#parseAndValidateOAIPMHXML(xml, response);

    // if (oaiResponse.status !== STATUS.OK) {
    //   return oaiResponse;
    // }

    // const { status, value } = oaiResponse;
    // if (!isOAIPMHListSetsResponse(value)) {
    //   return {
    //     status: STATUS.VALIDATION_ERROR,
    //     value: new ValidationError(xml, value, response),
    //   };
    // }

    // const { ListSets } = value;
    // return {
    //   status,
    //   value: {
    //     records: ListSets[0].val?.set,
    //     resumptionToken: parseResumptionToken(ListSets),
    //   },
    // };
  };
}
