import {
  type OAIPMHBaseResponseSharedRecord,
  validateOAIPMHBaseResponseAndGetValueOfKey,
} from "./shared.ts";
import type { ParsedXML } from "./parsed_xml.ts";

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
    value === "badArgument" ||
    value === "badResumptionToken" ||
    value === "badVerb" ||
    value === "cannotDisseminateFormat" ||
    value === "idDoesNotExist" ||
    value === "noRecordsMatch" ||
    value === "noMetadataFormats" ||
    value === "noSetHierarchy"
  );
}

type OAIPMHErrorResponse = OAIPMHBaseResponseSharedRecord & {
  error: {
    i: number;
    val?: string;
    attr: { "@_code": OAIPMHErrorCode };
  }[];
};

function isOAIPMHErrorResponse(value: ParsedXML): value is OAIPMHErrorResponse {
  const error = validateOAIPMHBaseResponseAndGetValueOfKey(value, "error");
  if (!error) {
    return false;
  }

  for (const errorElem of error) {
    const { val, attr } = errorElem;

    if ((val !== undefined && typeof val !== "string") || attr === undefined) {
      return false;
    }

    const attrEntries = Object.entries(attr);
    if (attrEntries.length !== 1) {
      return false;
    }

    const [attrKey, attrVal] = attrEntries[0]!;
    if (attrKey !== "@_code" || !isOAIPMHErrorCode(attrVal)) {
      return false;
    }
  }

  return true;
}

export {
  isOAIPMHErrorResponse,
  type OAIPMHErrorCode,
  type OAIPMHErrorResponse,
};
