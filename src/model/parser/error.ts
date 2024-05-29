import type { ParsedXMLElement, ParsedXMLRecord } from "./xml.ts";
import { InnerValidationError } from "../../error/validation_error.ts";
import { parseToRecordOrString } from "../../parser/xml_parser.ts";
import { OAIPMHResponseError } from "../../error/oai_pmh_response_error.ts";
import { parseKeyAsText, parseKeyAsTextWithAttributes } from "./shared.ts";

type OAIPMHErrorCode =
  | "badArgument"
  | "badResumptionToken"
  | "badVerb"
  | "cannotDisseminateFormat"
  | "idDoesNotExist"
  | "noRecordsMatch"
  | "noMetadataFormats"
  | "noSetHierarchy";

function isOAIPMHErrorCode(value: string): value is OAIPMHErrorCode {
  return (
    <OAIPMHErrorCode> value === "badArgument" ||
    <OAIPMHErrorCode> value === "badResumptionToken" ||
    <OAIPMHErrorCode> value === "badVerb" ||
    <OAIPMHErrorCode> value === "cannotDisseminateFormat" ||
    <OAIPMHErrorCode> value === "idDoesNotExist" ||
    <OAIPMHErrorCode> value === "noRecordsMatch" ||
    <OAIPMHErrorCode> value === "noMetadataFormats" ||
    <OAIPMHErrorCode> value === "noSetHierarchy"
  );
}

function validateAndGetOAIPMHErrorResponse(
  error: ParsedXMLElement[],
  parseResult: ParsedXMLRecord,
): OAIPMHResponseError {
  if (error.length === 0) {
    throw new InnerValidationError(
      "expected at least one of <OAI-PMH><error> node",
    );
  }

  const request = parseKeyAsTextWithAttributes(parseResult, "request");

  if (request instanceof Error) {
    throw new InnerValidationError(`todo`);
  }

  const responseDate = parseKeyAsText(parseResult, "responseDate");

  if (responseDate instanceof Error) {
    throw new InnerValidationError(`todo`);
  }

  const errors = error.map(({ value, attr }) => {
    const parsedValue = value === undefined
      ? value
      : parseToRecordOrString(value);

    if (parsedValue instanceof Error) {
      throw new InnerValidationError(
        `error parsing <OAI-PMH><error>: ${parsedValue.message}`,
      );
    }

    if (typeof parsedValue === "object" || attr === undefined) {
      throw new InnerValidationError(
        "expected all <OAI-PMH><error> nodes to either contain nothing or text, and to have attributes",
      );
    }

    const attrEntries = Object.entries(attr);
    if (attrEntries.length !== 1) {
      throw new InnerValidationError(
        "expected <OAI-PMH><error> to only have one attribute",
      );
    }

    const [attrKey, { value: attrVal }] = attrEntries[0]!;
    if (attrKey !== "code" || !isOAIPMHErrorCode(attrVal)) {
      throw new InnerValidationError(
        'expected <OAI-PMH><error> attribute key to be "code" and its value to be a valid OAI-PMH error code',
      );
    }

    return { code: attrVal, text: parsedValue };
  });

  return new OAIPMHResponseError({
    errors,
    request,
    responseDate,
  });
}

export { type OAIPMHErrorCode, validateAndGetOAIPMHErrorResponse };
