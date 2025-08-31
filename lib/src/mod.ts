export { OAIPMH } from "./oai-pmh.js";

export {
  OAIPMHResponseError,
  type OAIPMHResponseErrorCause,
  type OAIPMHResponseErrorData,
} from "./error/response-error.js";
export { OAIPMHRequestError as UnexpectedStatusCodeError } from "./error/request-error.js";
export { OAIPMHValidationError as ValidationError } from "./error/validation-error.js";

export type {
  ListOptions,
  OAIPMHRequestConstructorOptions,
} from "./model/oai-pmh.js";

export type { OAIPMHErrorCode } from "./model/parser/error.js";
export type { OAIPMHMetadataFormat } from "./model/parser/metadata_format.js";
export type { OAIPMHRecord } from "./model/parser/record.js";
export type { OAIPMHHeader } from "./model/parser/header.js";
export type { OAIPMHIdentify } from "./model/parser/identify.js";
export type { OAIPMHSet } from "./model/parser/set.js";
export type {
  ParsedXMLAttributes,
  ParsedXMLAttributeValue,
  ParsedXMLElement,
  ParsedXMLRecord,
} from "./model/parser/xml.js";
