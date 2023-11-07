import { isOAIPMHHeader, type OAIPMHHeader } from "./header.ts";
import {
  isOAIPMHResumptionToken,
  type OAIPMHBaseResponseSharedRecord,
  type OAIPMHResumptionToken,
  validateOAIPMHBaseResponseAndGetValueOfKey,
} from "./shared.ts";
import { parsedXMLHasKeysBetweenLengths } from "./util.ts";
import type { ParsedXML, ParsedXMLRecordValue } from "./parsed_xml.ts";

type OAIPMHRecord = {
  i: number;
  val: {
    header: [OAIPMHHeader];
    metadata?: [ParsedXMLRecordValue];
    about?: ParsedXMLRecordValue[];
  };
};

function isOAIPMHRecord(value: ParsedXMLRecordValue): value is OAIPMHRecord {
  const { val, attr } = value;
  if (
    val === undefined || typeof val === "string" ||
    !parsedXMLHasKeysBetweenLengths(val, 1, 3) || attr !== undefined
  ) {
    return false;
  }

  const { header, metadata } = val;
  if (
    header === undefined || header.length !== 1 ||
    !isOAIPMHHeader(header[0]!) ||
    (metadata !== undefined && metadata.length !== 1)
  ) {
    return false;
  }

  return true;
}

type OAIPMHGetRecordResponse = OAIPMHBaseResponseSharedRecord & {
  GetRecord: [{ i: number; val: { record: [OAIPMHRecord] } }];
};

function isOAIPMHGetRecordResponse(
  value: ParsedXML,
): value is OAIPMHGetRecordResponse {
  const GetRecord = validateOAIPMHBaseResponseAndGetValueOfKey(
    value,
    "GetRecord",
  );
  if (!GetRecord) {
    return false;
  }

  const { val, attr } = GetRecord[0]!;
  if (
    val === undefined || typeof val === "string" ||
    Object.keys(val).length !== 1 || attr !== undefined
  ) {
    return false;
  }

  const { record } = val;
  return record !== undefined && record.length === 1 &&
    isOAIPMHRecord(record[0]!);
}

type OAIPMHListRecordsResponse = OAIPMHBaseResponseSharedRecord & {
  ListRecords: [
    {
      i: number;
      val: { record: OAIPMHRecord[]; resumptionToken?: OAIPMHResumptionToken };
    },
  ];
};

function isOAIPMHListRecordsResponse(
  value: ParsedXML,
): value is OAIPMHListRecordsResponse {
  const ListRecords = validateOAIPMHBaseResponseAndGetValueOfKey(
    value,
    "ListRecords",
  );
  if (!ListRecords) {
    return false;
  }

  const { val, attr } = ListRecords[0]!;
  if (
    val === undefined || typeof val === "string" ||
    !parsedXMLHasKeysBetweenLengths(val, 1, 2) || attr !== undefined
  ) {
    return false;
  }

  const { record, resumptionToken } = val;

  if (
    record === undefined ||
    (resumptionToken !== undefined && !isOAIPMHResumptionToken(resumptionToken))
  ) {
    return false;
  }

  for (const recordElem of record) {
    if (!isOAIPMHRecord(recordElem)) {
      return false;
    }
  }

  return true;
}

export {
  isOAIPMHGetRecordResponse,
  isOAIPMHListRecordsResponse,
  type OAIPMHRecord,
};
