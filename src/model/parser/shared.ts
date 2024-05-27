import { parseToRecordOrString } from "../../parser/xml_parser.ts";
import type { ParsedXML, ParsedXMLRecordValue } from "./parsed_xml.ts";
import type {
  ParsedXMLAttributes,
  ParsedXMLElement,
  ParsedXMLRecord,
} from "./xml.ts";

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

type RecordKeysMapped<TKeys extends string[]> = {
  [TKey in TKeys[number]]: string;
};

type TextNodeWithAttributes = { attr: ParsedXMLAttributes; value: string };

function validateTextNodeWithAttributes(
  parsedNode?: ParsedXMLElement[],
): TextNodeWithAttributes {
  if (parsedNode === undefined || parsedNode.length !== 1) {
    throw new Error("todo");
  }

  const { attr, value } = parsedNode[0]!;
  if (attr === undefined || value === undefined) {
    throw new Error("todo");
  }

  const parsedChildNodeList = parseToRecordOrString(value);
  if (typeof parsedChildNodeList !== "string") {
    throw new Error("todo");
  }

  return { attr, value: parsedChildNodeList };
}

function validateTextNode(parsedNode?: ParsedXMLElement[]): string {
  if (parsedNode === undefined || parsedNode.length !== 1) {
    throw new Error("todo");
  }

  const { attr, value } = parsedNode[0]!;
  if (attr !== undefined || value === undefined) {
    throw new Error("todo");
  }

  const parsedChildNodeList = parseToRecordOrString(value);
  if (typeof parsedChildNodeList !== "string") {
    throw new Error("todo");
  }

  return parsedChildNodeList;
}

function extractKeyAndValidate(record: ParsedXMLRecord, key: string): string {
  const recordValue = record[key];
  if (recordValue === undefined || recordValue.length !== 1) {
    throw new Error("todo");
  }

  const { attr, value } = recordValue[0]!;
  if (attr !== undefined || value === undefined) {
    throw new Error("todo");
  }

  const parsedChildNodeList = parseToRecordOrString(value);
  if (typeof parsedChildNodeList !== "string") {
    throw new Error("todo");
  }

  return parsedChildNodeList;
}

function extractKeysAndValidate<T extends string[]>(
  record: ParsedXMLRecord,
  ...keys: T
): RecordKeysMapped<T> | Error {
  const mapped: Record<string, string> = {};
  for (const key of keys) {
    const recordValue = record[key];
    if (recordValue === undefined || recordValue.length !== 1) {
      // @TODO:
      return new Error("todo");
    }

    const { attr, value } = recordValue[0]!;
    if (attr !== undefined || value === undefined) {
      return new Error("todo");
    }

    const parsedChildNodeList = parseToRecordOrString(value);
    if (typeof parsedChildNodeList !== "string") {
      return new Error("todo");
    }

    mapped[key] = parsedChildNodeList;
  }

  return <RecordKeysMapped<T>> mapped;
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
  return responseValue !== undefined &&
      request !== undefined &&
      responseDate !== undefined &&
      Object.keys(value).length === 3
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
  extractKeyAndValidate,
  extractKeysAndValidate,
  isOAIPMHResumptionToken,
  isStringWithNoAttribute,
  isStringWithNoAttributeTuple,
  type OAIPMHBaseResponseSharedRecord,
  type OAIPMHResumptionToken,
  type StringWithNoAttribute,
  type StringWithNoAttributeTuple,
  type TextNodeWithAttributes,
  validateOAIPMHBaseResponseAndGetValueOfKey,
  validateTextNode,
  validateTextNodeWithAttributes,
};
