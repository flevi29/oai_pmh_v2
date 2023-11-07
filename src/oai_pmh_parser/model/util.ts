import type { ParsedXML } from "./parsed_xml.ts";

function parsedXMLHasKeysBetweenLengths(
  value: ParsedXML,
  length1: number,
  length2: number,
): boolean {
  const { length } = Object.keys(value);
  return length >= length1 && length <= length2;
}

export { parsedXMLHasKeysBetweenLengths };
