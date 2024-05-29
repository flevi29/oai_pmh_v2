import { XMLParser } from "./xml_parser.ts";
import {
  InnerValidationError,
  ValidationError,
} from "../error/validation_error.ts";
import { type OAIPMHIdentify } from "../model/parser/identify.ts";
import {
  type OAIPMHRecord,
  parseGetRecordResponse,
  parseListRecordsResponse,
} from "../model/parser/record.ts";
import {
  type OAIPMHHeader,
  parseListIdentifiersResponse,
} from "../model/parser/header.ts";
import {
  type OAIPMHMetadataFormat,
  validateListMetadataFormatsResponse,
} from "../model/parser/metadata_format.ts";
import { type OAIPMHSet } from "../model/parser/set.ts";
import type { ListResponse } from "../model/parser/shared.ts";

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
    return validationErrorWrap(xml, this.#xmlParser, parseGetRecordResponse);
  };

  readonly parseListIdentifiers = (xml: string): ListResponse<OAIPMHHeader> => {
    return validationErrorWrap(
      xml,
      this.#xmlParser,
      parseListIdentifiersResponse,
    );
  };

  readonly parseListMetadataFormats = (xml: string): OAIPMHMetadataFormat[] => {
    return validationErrorWrap(
      xml,
      this.#xmlParser,
      validateListMetadataFormatsResponse,
    );
  };

  readonly parseListRecords = (xml: string): ListResponse<OAIPMHRecord> => {
    return validationErrorWrap(xml, this.#xmlParser, parseListRecordsResponse);
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
