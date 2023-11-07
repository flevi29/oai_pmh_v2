import type { ParsedXML, ParsedXMLRecordValue } from "./parsed_xml.ts";

type StringWithNoAttribute = { i: number; val: string };

function isStringWithNoAttribute(
  value: ParsedXMLRecordValue,
): value is StringWithNoAttribute {
  return value.attr === undefined && typeof value.val === "string";
}

type StringWithNoAttributeTuple = [StringWithNoAttribute];

function isStringWithNoAttributeTuple(
  value: ParsedXMLRecordValue[],
): value is StringWithNoAttributeTuple {
  return value.length === 1 && isStringWithNoAttribute(value[0]!);
}

type OAIPMHBaseResponseSharedRecord = {
  request: ParsedXMLRecordValue[];
  responseDate: ParsedXMLRecordValue[];
};

function validateOAIPMHBaseResponseAndGetValueOfKey(
  value: ParsedXML,
  key: string,
): ParsedXMLRecordValue[] | false {
  const { [key]: responseValue, request, responseDate } = value;
  return responseValue !== undefined && request !== undefined &&
      responseDate !== undefined && Object.keys(value).length === 3
    ? responseValue
    : false;
}

type OAIPMHResumptionToken = [
  { i: number; val?: string; attr?: Record<string, string> },
];

function isOAIPMHResumptionToken(
  value: ParsedXMLRecordValue[],
): value is OAIPMHResumptionToken {
  if (value.length !== 1) {
    return false;
  }

  const [v] = value;
  if (v === undefined) {
    return false;
  }

  const { val } = v;
  // optional because some providers return an empty tag
  return val === undefined || typeof val === "string";
}

export {
  isOAIPMHResumptionToken,
  isStringWithNoAttribute,
  isStringWithNoAttributeTuple,
  type OAIPMHBaseResponseSharedRecord,
  type OAIPMHResumptionToken,
  type StringWithNoAttribute,
  type StringWithNoAttributeTuple,
  validateOAIPMHBaseResponseAndGetValueOfKey,
};
