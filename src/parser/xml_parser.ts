/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type {
  ParsedXMLAttributes,
  ParsedXMLAttributeValue,
  ParsedXMLElement,
  ParsedXMLRecord,
} from "../model/parser/xml.ts";

function getPrefixAndLocalName(
  nodeName: string,
): [prefix: string | undefined, localName: string] {
  const indexOfColon = nodeName.indexOf(":");

  return indexOfColon === -1
    ? [, nodeName]
    : [nodeName.slice(0, indexOfColon), nodeName.slice(indexOfColon + 1)];
}

function parseAtributes(attributes: NamedNodeMap): ParsedXMLAttributes {
  const attr: ParsedXMLAttributes = {};
  for (const attribute of attributes) {
    const { name: combinedName, value } = attribute;
    const [prefix, name] = getPrefixAndLocalName(combinedName);

    const attrValue: ParsedXMLAttributeValue = { value };
    if (prefix !== undefined) {
      attrValue.prefix = prefix;
    }

    attr[name] = attrValue;
  }

  return attr;
}

function parseElementNode(node: Element): ParsedXMLElement {
  const { nodeName, attributes, childNodes } = node;
  const [prefix, name] = getPrefixAndLocalName(nodeName);

  const parsed: ParsedXMLElement = { name };

  if (prefix !== undefined) {
    parsed.prefix = prefix;
  }

  if (node.hasAttributes()) {
    parsed.attr = parseAtributes(attributes);
  }

  if (node.hasChildNodes()) {
    parsed.value = childNodes;
  }

  return parsed;
}

function parseTextNode(node: Text | CDATASection): string {
  // NOTE: `nodeValue` of Text or CDATASection cannot be null
  return node.nodeValue!;
}

function parseChildNode(
  childNode: ChildNode,
): string | ParsedXMLElement | undefined | Error {
  switch (childNode.nodeType) {
    case childNode.ELEMENT_NODE: {
      return parseElementNode(<Element> childNode);
    }
    case childNode.TEXT_NODE:
    case childNode.CDATA_SECTION_NODE: {
      return parseTextNode(<Text | CDATASection> childNode);
    }
    case childNode.COMMENT_NODE: {
      return undefined;
    }
    default: {
      return new Error(
        `node type ${childNode.nodeType} not supported/implemented`,
      );
    }
  }
}

const NON_WHITESPACE = /\S/;

function parseToRecordOrString(
  childNodeList: NodeListOf<ChildNode>,
): ParsedXMLRecord | string | undefined | Error {
  let parsedXMLRecord: ParsedXMLRecord | string | undefined = undefined;

  for (const childNode of childNodeList) {
    switch (childNode.nodeType) {
      case childNode.ELEMENT_NODE: {
        if (typeof parsedXMLRecord === "string") {
          return new Error(
            "invalid XML for OAI-PMH, Text and Element nodes can not mix at this level",
          );
        }

        const parsed = parseElementNode(<Element> childNode);
        // `??=` doesn't seem to be doing type narrowing
        ((<ParsedXMLRecord> (parsedXMLRecord ??= {}))[parsed.name] ??= []).push(
          parsed,
        );

        break;
      }
      case childNode.TEXT_NODE:
      case childNode.CDATA_SECTION_NODE: {
        const parsed = parseTextNode(<Text | CDATASection> childNode);

        if (!NON_WHITESPACE.test(parsed)) {
          continue;
        }

        if (typeof parsedXMLRecord === "object") {
          return new Error(
            "invalid XML for OAI-PMH, Text and Element nodes can not mix at this level",
          );
        }

        parsedXMLRecord = parsedXMLRecord === undefined
          ? parsed
          : parsedXMLRecord + parsed;

        break;
      }
      case childNode.COMMENT_NODE: {
        break;
      }
      default: {
        return new Error(
          `node type ${childNode.nodeType} not supported/implemented`,
        );
      }
    }
  }

  return parsedXMLRecord;
}

class XMLParser {
  readonly #domParser: DOMParser;

  constructor(domParser: typeof DOMParser) {
    this.#domParser = new domParser();
  }

  parse(xml: string): XMLDocument {
    return this.#domParser.parseFromString(xml, "text/xml");
  }
}

export { parseChildNode, parseToRecordOrString, XMLParser };
