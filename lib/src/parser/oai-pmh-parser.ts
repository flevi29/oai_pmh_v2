import { XMLParser } from "./xml_parser.js";
import {
  OAIPMHInnerValidationError,
  OAIPMHValidationError,
} from "../error/validation-error.js";
import {
  type OAIPMHIdentify,
  parseIdentifyResponse,
} from "../model/parser/identify.js";
import {
  type OAIPMHRecord,
  parseGetRecordResponse,
  parseListRecordsResponse,
} from "../model/parser/record.js";
import {
  type OAIPMHHeader,
  parseListIdentifiersResponse,
} from "../model/parser/header.js";
import {
  type OAIPMHMetadataFormat,
  validateListMetadataFormatsResponse,
} from "../model/parser/metadata_format.js";
import { type OAIPMHSet, parseListSetsResponse } from "../model/parser/set.js";
import type { ListResponse } from "../model/parser/shared.js";

// TODO: do not validate instead provide a callback for validation
// for instance https://github.com/nikku/node-xsd-schema-validator
export class OAIPMHParser {
  readonly #xmlParser: XMLParser;

  constructor(domParser: typeof DOMParser) {
    this.#xmlParser = new XMLParser(domParser);
  }

  #validationErrorWrap<TReturn>(
    xml: string,
    callback: (childNodes: NodeListOf<ChildNode>) => TReturn,
  ): NoInfer<TReturn> {
    const { childNodes } = this.#xmlParser.parse(xml);

    try {
      return callback(childNodes);
    } catch (error: unknown) {
      if (error instanceof OAIPMHInnerValidationError) {
        throw new OAIPMHValidationError(error, xml);
      }

      throw error;
    }
  }

  readonly parseIdentify = (xml: string): OAIPMHIdentify => {
    return this.#validationErrorWrap(xml, parseIdentifyResponse);
  };

  readonly parseGetRecord = (xml: string): OAIPMHRecord => {
    return this.#validationErrorWrap(xml, parseGetRecordResponse);
  };

  readonly parseListIdentifiers = (xml: string): ListResponse<OAIPMHHeader> => {
    return this.#validationErrorWrap(xml, parseListIdentifiersResponse);
  };

  readonly parseListMetadataFormats = (xml: string): OAIPMHMetadataFormat[] => {
    return this.#validationErrorWrap(xml, validateListMetadataFormatsResponse);
  };

  readonly parseListRecords = (xml: string): ListResponse<OAIPMHRecord> => {
    return this.#validationErrorWrap(xml, parseListRecordsResponse);
  };

  readonly parseListSets = (xml: string): ListResponse<OAIPMHSet> => {
    return this.#validationErrorWrap(xml, parseListSetsResponse);
  };
}
