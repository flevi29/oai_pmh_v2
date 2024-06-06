import { parseToRecordOrString } from "$rootSrc/parser/xml_parser";

export function parseBaseURLs(childNodeList: NodeListOf<ChildNode>): string[] {
  const parseResult = parseToRecordOrString(childNodeList);

  if (parseResult instanceof Error) {
    throw new Error(
      `error parsing base XML contents: ${parseResult.message}`,
    );
  }

  if (typeof parseResult !== "object") {
    throw new Error(
      "expected base XML to have child nodes other than text",
    );
  }

  const { BaseURLs } = parseResult;
  if (Object.keys(parseResult).length !== 1 || BaseURLs === undefined) {
    throw new Error("expected base XML to have one <BaseURLs> child node");
  }

  const { value } = BaseURLs[0]!;
  if (value === undefined) {
    throw new Error("expected <BaseURLs> node not to be empty");
  }

  const nextParseResult = parseToRecordOrString(value);

  if (nextParseResult instanceof Error) {
    throw new Error(
      `error parsing <BaseURLs> contents: ${nextParseResult.message}`,
    );
  }

  if (typeof nextParseResult !== "object") {
    throw new Error(
      "expected <BaseURLs> to have child nodes othen than text",
    );
  }

  const { baseURL } = nextParseResult;
  if (baseURL === undefined) {
    throw new Error("expected <BaseURLs> to have <baseURL> child nodes");
  }

  return baseURL.map(({ value }) => {
    if (value === undefined) {
      throw new Error("expected <BaseURLs><baseURL> not to be empty");
    }

    const parsedBaseURL = parseToRecordOrString(value);

    if (typeof parsedBaseURL !== "string") {
      throw new Error("expected <BaseURLs><baseURL> to be a text node");
    }

    return parsedBaseURL;
  });
}
