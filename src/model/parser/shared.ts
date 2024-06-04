import { parseToRecordOrString } from "../../parser/xml_parser.ts";
import type {
  ParsedXMLAttributes,
  ParsedXMLElement,
  ParsedXMLRecord,
} from "./xml.ts";

type TextNodeWithAttributes = { attr?: ParsedXMLAttributes; value: string };

function parseTextNodeWithAttributes(
  parsedNode?: ParsedXMLElement[],
): TextNodeWithAttributes | Error {
  if (parsedNode === undefined || parsedNode.length !== 1) {
    return new Error("todo");
  }

  const { attr, value } = parsedNode[0]!;
  if (value === undefined) {
    return new Error("todo");
  }

  const parsedChildNodeList = parseToRecordOrString(value);
  if (typeof parsedChildNodeList !== "string") {
    return new Error("todo");
  }

  return { attr, value: parsedChildNodeList };
}

function parseKeyAsTextWithAttributes(
  record: ParsedXMLRecord,
  key: string,
): TextNodeWithAttributes | Error {
  const parsedRecordValue = parseTextNodeWithAttributes(record[key]);

  if (parsedRecordValue instanceof Error) {
    return new Error("todo");
  }

  return parsedRecordValue;
}

function parseTextNode({ attr, value }: ParsedXMLElement): string | Error {
  if (attr !== undefined || value === undefined) {
    return new Error("todo");
  }

  const parsedChildNodeList = parseToRecordOrString(value);
  if (typeof parsedChildNodeList !== "string") {
    return new Error("todo");
  }

  return parsedChildNodeList;
}

function parseTextNodeArray(
  parsedXMLElements: ParsedXMLElement[],
): string[] | Error {
  const parsedTextArray: string[] = new Array(parsedXMLElements.length);
  for (let i = 0; i < parsedXMLElements.length; i += 1) {
    const parsedTextNode = parseTextNode(parsedXMLElements[i]!);

    if (parsedTextNode instanceof Error) {
      return new Error("todo");
    }

    parsedTextArray[i] = parsedTextNode;
  }

  return parsedTextArray;
}

function parseKeyAsText(record: ParsedXMLRecord, key: string): string | Error {
  const recordValue = record[key];

  if (recordValue === undefined || recordValue.length !== 1) {
    return new Error("todo");
  }

  return parseTextNode(recordValue[0]!);
}

function parseKeyAsTextArray(
  record: ParsedXMLRecord,
  key: string,
): string[] | Error {
  const recordValue = record[key];

  if (recordValue === undefined) {
    return new Error("todo");
  }

  return parseTextNodeArray(recordValue);
}

function parseToNodeList(
  parsedXMLElementArray: ParsedXMLElement[],
): NodeListOf<ChildNode> | Error {
  if (parsedXMLElementArray.length !== 1) {
    return new Error("todo");
  }

  const { attr, value } = parsedXMLElementArray[0]!;

  if (attr !== undefined || value === undefined) {
    return new Error("todo");
  }

  return value;
}

function parseResumptionToken(
  resumptionToken?: ParsedXMLElement[],
): string | null | Error {
  if (resumptionToken === undefined) {
    return null;
  }

  if (resumptionToken.length !== 1) {
    throw new Error("expected there to be one <resumptionToken> element node");
  }

  const { value } = resumptionToken[0]!,
    parsedResumptionToken = value === undefined
      ? null
      : parseToRecordOrString(value);

  if (parsedResumptionToken instanceof Error) {
    return new Error(
      `error parsing <resumptionToken> contents: ${parsedResumptionToken.message}`,
    );
  }

  if (
    typeof parsedResumptionToken !== "string" &&
    parsedResumptionToken !== null
  ) {
    return new Error(
      "expected <resumptionToken> node to be empty or only contain text",
    );
  }

  return parsedResumptionToken;
}

type ListResponse<T> = {
  records: T[];
  resumptionToken: string | null;
};

export {
  type ListResponse,
  parseKeyAsText,
  parseKeyAsTextArray,
  parseKeyAsTextWithAttributes,
  parseResumptionToken,
  parseTextNode,
  parseTextNodeArray,
  parseTextNodeWithAttributes,
  parseToNodeList,
  type TextNodeWithAttributes,
};
