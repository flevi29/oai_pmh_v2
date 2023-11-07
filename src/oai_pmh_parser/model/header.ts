import {
  isOAIPMHResumptionToken,
  isStringWithNoAttribute,
  isStringWithNoAttributeTuple,
  type OAIPMHBaseResponseSharedRecord,
  type OAIPMHResumptionToken,
  type StringWithNoAttribute,
  type StringWithNoAttributeTuple,
  validateOAIPMHBaseResponseAndGetValueOfKey,
} from "./shared.ts";
import { parsedXMLHasKeysBetweenLengths } from "./util.ts";
import type { ParsedXML, ParsedXMLRecordValue } from "./parsed_xml.ts";

type OAIPMHHeader = {
  i: number;
  attr?: { "@_status": "deleted" };
  val: {
    identifier: StringWithNoAttributeTuple;
    datestamp: StringWithNoAttributeTuple;
    setSpec?: StringWithNoAttribute[];
  };
};

function isOAIPMHHeader(value: ParsedXMLRecordValue): value is OAIPMHHeader {
  const { attr, val } = value;

  if (attr !== undefined) {
    const attrEntries = Object.entries(attr);
    if (attrEntries.length !== 1) {
      return false;
    }

    const [attrKey, attrVal] = attrEntries[0]!;
    if (attrKey !== "@_status" || attrVal !== "deleted") {
      return false;
    }
  }

  if (
    val === undefined ||
    typeof val === "string" ||
    !parsedXMLHasKeysBetweenLengths(val, 2, 3)
  ) {
    return false;
  }

  const { identifier, datestamp, setSpec } = val;

  if (
    identifier === undefined ||
    !isStringWithNoAttributeTuple(identifier) ||
    datestamp === undefined ||
    !isStringWithNoAttributeTuple(datestamp)
  ) {
    return false;
  }

  if (setSpec !== undefined) {
    for (const setSpecElement of setSpec) {
      if (!isStringWithNoAttribute(setSpecElement)) {
        return false;
      }
    }
  }

  return true;
}

type OAIPMHListIdentifiersResponse = OAIPMHBaseResponseSharedRecord & {
  ListIdentifiers: [
    {
      i: number;
      val: {
        header: OAIPMHHeader[];
        resumptionToken: OAIPMHResumptionToken;
      };
    },
  ];
};

function isOAIPMHListIdentifiersResponse(
  value: ParsedXML,
): value is OAIPMHListIdentifiersResponse {
  const ListIdentifiers = validateOAIPMHBaseResponseAndGetValueOfKey(
    value,
    "ListIdentifiers",
  );
  if (!ListIdentifiers) {
    return false;
  }

  const { val } = ListIdentifiers[0]!;
  if (val === undefined || typeof val === "string") {
    return false;
  }

  const { header, resumptionToken } = val;

  if (header === undefined) {
    return false;
  }

  for (const headerElement of header) {
    if (!isOAIPMHHeader(headerElement)) {
      return false;
    }
  }

  return (
    resumptionToken === undefined || isOAIPMHResumptionToken(resumptionToken)
  );
}

export { isOAIPMHHeader, isOAIPMHListIdentifiersResponse, type OAIPMHHeader };
