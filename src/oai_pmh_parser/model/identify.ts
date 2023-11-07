import {
  isStringWithNoAttribute,
  isStringWithNoAttributeTuple,
  type OAIPMHBaseResponseSharedRecord,
  type StringWithNoAttribute,
  type StringWithNoAttributeTuple,
  validateOAIPMHBaseResponseAndGetValueOfKey,
} from "./shared.ts";
import { parsedXMLHasKeysBetweenLengths } from "./util.ts";
import type { ParsedXML, ParsedXMLRecordValue } from "./parsed_xml.ts";

type OAIPMHIdentify = {
  i: number;
  val: {
    repositoryName: StringWithNoAttributeTuple;
    baseURL: StringWithNoAttributeTuple;
    protocolVersion: StringWithNoAttributeTuple;
    earliestDatestamp: StringWithNoAttributeTuple;
    deletedRecord: [{ i: number; val: "no" | "transient" | "persistent" }];
    granularity: [{ i: number; val: "YYYY-MM-DD" | "YYYY-MM-DDThh:mm:ssZ" }];
    adminEmail: StringWithNoAttributeTuple;
    compression?: StringWithNoAttribute[];
    description?: ParsedXMLRecordValue[];
  };
};

function isOAIPMHDeletedRecord(
  value: ParsedXMLRecordValue[],
): value is OAIPMHIdentify["val"]["deletedRecord"] {
  if (value.length !== 1) {
    return false;
  }

  const { val, attr } = value[0]!;
  return attr === undefined && (val === "no" || val === "transient" ||
    val === "persistent");
}

function isOAIPMHGranularity(
  value: ParsedXMLRecordValue[],
): value is OAIPMHIdentify["val"]["granularity"] {
  if (value.length !== 1) {
    return false;
  }

  const { val, attr } = value[0]!;
  return attr === undefined &&
    (val === "YYYY-MM-DD" || val === "YYYY-MM-DDThh:mm:ssZ");
}

function isOAIPMHIdentify(
  value: ParsedXMLRecordValue,
): value is OAIPMHIdentify {
  const { attr, val } = value;
  if (
    attr !== undefined || val === undefined || typeof val === "string" ||
    !parsedXMLHasKeysBetweenLengths(val, 7, 9)
  ) {
    return false;
  }

  const {
    repositoryName,
    baseURL,
    protocolVersion,
    earliestDatestamp,
    deletedRecord,
    granularity,
    adminEmail,
    compression,
  } = val;

  if (
    repositoryName === undefined ||
    !isStringWithNoAttributeTuple(repositoryName) ||
    baseURL === undefined || !isStringWithNoAttributeTuple(baseURL) ||
    protocolVersion === undefined ||
    !isStringWithNoAttributeTuple(protocolVersion) ||
    earliestDatestamp === undefined ||
    !isStringWithNoAttributeTuple(earliestDatestamp) ||
    deletedRecord === undefined || !isOAIPMHDeletedRecord(deletedRecord) ||
    granularity === undefined || !isOAIPMHGranularity(granularity) ||
    adminEmail === undefined || !isStringWithNoAttributeTuple(adminEmail)
  ) {
    return false;
  }

  if (compression !== undefined) {
    for (const compressionElement of compression) {
      if (!isStringWithNoAttribute(compressionElement)) {
        return false;
      }
    }
  }

  return true;
}

type OAIPMHIdentifyResponse = OAIPMHBaseResponseSharedRecord & {
  Identify: [OAIPMHIdentify];
};

function isOAIPMHIdentifyResponse(
  value: ParsedXML,
): value is OAIPMHIdentifyResponse {
  const Identify = validateOAIPMHBaseResponseAndGetValueOfKey(
    value,
    "Identify",
  );
  if (!Identify) {
    return false;
  }

  return isOAIPMHIdentify(Identify[0]!);
}

export { isOAIPMHIdentifyResponse, type OAIPMHIdentify };
