/// <reference lib="dom" />
//// <reference lib="dom.iterable" />

type ParsedXMLAttributeValue = { prefix?: string; value: string };
type ParsedXMLAttributes = Record<string, ParsedXMLAttributeValue>;

// Parsed XML where there might be text nodes inbetween element nodes

type ParsedXMLElement = {
  prefix?: string;
  name: string;
  attr?: ParsedXMLAttributes;
  value?: NodeListOf<ChildNode>;
};

// Simplified parsed XML, where we know there shouldn't be text nodes inbetween element nodes

type ParsedXMLRecord = Record<string, ParsedXMLElement[]>;

export type {
  ParsedXMLAttributes,
  ParsedXMLAttributeValue,
  ParsedXMLElement,
  ParsedXMLRecord,
};
