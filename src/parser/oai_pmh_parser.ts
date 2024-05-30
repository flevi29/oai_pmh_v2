import { XMLParser } from "./xml_parser.ts";
import {
  InnerValidationError,
  ValidationError,
} from "../error/validation_error.ts";
import {
  type OAIPMHIdentify,
  parseIdentifyResponse,
} from "../model/parser/identify.ts";
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
import { type OAIPMHSet, parseListSetsResponse } from "../model/parser/set.ts";
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
    return validationErrorWrap(xml, this.#xmlParser, parseIdentifyResponse);
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
    return validationErrorWrap(xml, this.#xmlParser, parseListSetsResponse);
  };
}
