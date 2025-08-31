import type { ParsedXMLElement } from "oai_pmh_v2/model/parser/xml";

export function validateParsedXMLElement(v: unknown): ParsedXMLElement | null {
  if (v === null || typeof v !== "object") {
    return null;
  }

  const keys = Object.keys(v);
  if (keys.length < 1 || keys.length > 4) {
    return null;
  }

  const { prefix, name, attr, value } = <Record<string, unknown>>v;

  if (
    typeof name !== "string" ||
    (prefix !== undefined && typeof prefix !== "string") ||
    (value !== undefined && !(value instanceof NodeList))
  ) {
    return null;
  }

  if (attr !== undefined) {
    if (attr === null || typeof attr !== "object") {
      return null;
    }

    const attrElems = Object.values(attr);
    if (attrElems.length === 0) {
      return null;
    }

    for (const attrElem of attrElems) {
      if (attrElem === null || typeof attrElem !== "object") {
        return null;
      }

      const attrElemKeys = Object.keys(attrElem);
      if (attrElemKeys.length < 1 || attrElemKeys.length > 2) {
        return null;
      }

      const { prefix: attrElemPrefix, value: attrElemValue } = attrElem;
      if (
        (attrElemPrefix !== undefined && typeof attrElemPrefix !== "string") ||
        typeof attrElemValue !== "string"
      ) {
        return null;
      }
    }
  }

  return <ParsedXMLElement>v;
}
