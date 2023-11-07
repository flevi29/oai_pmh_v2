import {
  isOAIPMHResumptionToken,
  isStringWithNoAttributeTuple,
  type OAIPMHBaseResponseSharedRecord,
  type OAIPMHResumptionToken,
  type StringWithNoAttributeTuple,
  validateOAIPMHBaseResponseAndGetValueOfKey,
} from "./shared.ts";
import type { ParsedXML, ParsedXMLRecordValue } from "./parsed_xml.ts";

type OAIPMHSet = {
  i: number;
  val: {
    setName: StringWithNoAttributeTuple;
    setSpec: StringWithNoAttributeTuple;
  };
};

function isOAIPMHSet(value: ParsedXMLRecordValue): value is OAIPMHSet {
  const { val, attr } = value;
  if (
    val === undefined || typeof val === "string" ||
    Object.keys(val).length !== 2 || attr !== undefined
  ) {
    return false;
  }

  const { setName, setSpec } = val;
  return setName !== undefined && isStringWithNoAttributeTuple(setName) &&
    setSpec !== undefined && isStringWithNoAttributeTuple(setSpec);
}

type OAIPMHListSetsResponse = OAIPMHBaseResponseSharedRecord & {
  ListSets: [
    {
      i: number;
      val: { set: OAIPMHSet[]; resumptionToken?: OAIPMHResumptionToken };
    },
  ];
};

function isOAIPMHListSetsResponse(
  value: ParsedXML,
): value is OAIPMHListSetsResponse {
  const ListSets = validateOAIPMHBaseResponseAndGetValueOfKey(
    value,
    "ListSets",
  );
  if (!ListSets) {
    return false;
  }

  const { val, attr } = ListSets[0]!;
  if (attr !== undefined || val === undefined || typeof val === "string") {
    return false;
  }

  const { set, resumptionToken } = val;
  if (
    set === undefined ||
    (resumptionToken !== undefined &&
      !isOAIPMHResumptionToken(resumptionToken))
  ) {
    return false;
  }

  for (const setElem of set) {
    if (!isOAIPMHSet(setElem)) {
      return false;
    }
  }

  return true;
}

export { isOAIPMHListSetsResponse, type OAIPMHSet };
