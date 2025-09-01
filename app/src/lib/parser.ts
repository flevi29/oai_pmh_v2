import {
  NON_WHITESPACE,
  parseElementNode,
  parseTextNode,
} from "oai-pmh-2-js/parser/xml_parser";
import type { ParsedXMLElement } from "oai-pmh-2-js/model/parser/xml";

const SOME_TYPE = Object.freeze({
  TEXT: 0,
  ELEMENT: 1,
  UNPARSED: 2,
  ERROR: 3,
});
type SomeType = typeof SOME_TYPE;

type SomeReturnType =
  | { type: SomeType["TEXT"] | SomeType["UNPARSED"]; value: string }
  | { type: SomeType["ELEMENT"]; value: ParsedXMLElement }
  | { type: SomeType["ERROR"]; value: Error };

const serializer = new XMLSerializer();

function parseChildNode(childNode: ChildNode): SomeReturnType | null {
  switch (childNode.nodeType) {
    case childNode.ELEMENT_NODE: {
      return {
        type: SOME_TYPE.ELEMENT,
        value: parseElementNode(<Element>childNode),
      };
    }
    case childNode.TEXT_NODE:
    case childNode.CDATA_SECTION_NODE: {
      const value = parseTextNode(<Text | CDATASection>childNode);

      if (!NON_WHITESPACE.test(value)) {
        return null;
      }

      return { type: SOME_TYPE.TEXT, value };
    }
    case childNode.PROCESSING_INSTRUCTION_NODE:
    case childNode.COMMENT_NODE:
    case childNode.DOCUMENT_TYPE_NODE:
    case childNode.DOCUMENT_FRAGMENT_NODE: {
      return {
        type: SOME_TYPE.UNPARSED,
        value: serializer.serializeToString(childNode),
      };
    }
    default: {
      return {
        type: SOME_TYPE.ERROR,
        value: new Error(
          `node type ${childNode.nodeType} not supported/implemented`,
        ),
      };
    }
  }
}

function parseChildNodeList(
  childNodeList: NodeListOf<ChildNode>,
): SomeReturnType[] | null {
  let parsedChildNodeList: SomeReturnType[] | null = null;

  for (const childNode of childNodeList) {
    const parsedChildNode = parseChildNode(childNode);

    if (parsedChildNode !== null) {
      (parsedChildNodeList ??= []).push(parsedChildNode);
    }
  }

  return parsedChildNodeList;
}

export { parseChildNodeList, SOME_TYPE, type SomeReturnType };
