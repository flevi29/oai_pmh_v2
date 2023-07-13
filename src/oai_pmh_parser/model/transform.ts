import { z } from "../../../deps.ts";
import { NonConformingError } from "../error/non_conforming_error.ts";
import { RESPONSE } from "./oai.ts";

type ParsedXML = Record<
  string,
  Record<string, string> | ParsedXML | [{ "#text": string }]
>[];

const PARSED_XML: z.ZodType<ParsedXML> = z.lazy(() =>
  z.array(
    z.record(
      z.union([
        z.record(z.string()),
        z.tuple([z.strictObject({ "#text": z.string() })]),
        PARSED_XML,
      ]),
    ),
  )
);

type TransformedParsedXMLValue = {
  i: number;
  attr?: Record<string, string>;
  val?: string | TransformedParsedXML;
};
const TRANSFORMED_PARSED_XML_VALUE = z.custom<TransformedParsedXMLValue>();

type TransformedParsedXML = Record<string, TransformedParsedXMLValue[]>;

function getAttr(parsedXML: ParsedXML[number]) {
  if (Object.hasOwn(parsedXML, ":@")) {
    const attr = <Record<string, string>> parsedXML[":@"];
    delete parsedXML[":@"];
    return attr;
  }
}

function transformParsedXML(parsedXML: ParsedXML) {
  if (parsedXML.length === 0) {
    return;
  }

  const transformedParsedXML: TransformedParsedXML = {};

  for (let i = 0; i < parsedXML.length; i += 1) {
    const parsedXMLElem = parsedXML[i];

    const attr = getAttr(parsedXMLElem);

    const parsedXMLElemEntries = Object.entries(parsedXMLElem);
    if (parsedXMLElemEntries.length !== 1) {
      throw new Error(
        `invalid parsed XML element, must only have one object entry besides attributes: ${
          JSON.stringify(
            { attr, parsedXMLElem },
          )
        }`,
      );
    }

    const newEntry: TransformedParsedXMLValue = { i };
    if (attr !== undefined) {
      newEntry.attr = attr;
    }

    const [[key, val]] = parsedXMLElemEntries;

    if (val.length === 1 && Object.hasOwn(val[0], "#text")) {
      newEntry.val = <string> val[0]["#text"];
    } else {
      const subTransformedParsedXML = transformParsedXML(<ParsedXML> val);
      if (subTransformedParsedXML !== undefined) {
        newEntry.val = subTransformedParsedXML;
      }
    }

    (transformedParsedXML[key] ??= []).push(newEntry);
  }

  return transformedParsedXML;
}

function validateAndTransform(parsedXML: unknown) {
  const tryParseXML = PARSED_XML.safeParse(parsedXML);
  if (!tryParseXML.success) {
    throw new NonConformingError(tryParseXML.error);
  }

  const transformedParsedXML = transformParsedXML(tryParseXML.data);
  if (transformedParsedXML === undefined) {
    throw new Error(
      `received XML has no relevant data: ${JSON.stringify(parsedXML)}`,
    );
  }

  const tryParseTransformedXML = RESPONSE.safeParse(
    transformedParsedXML,
  );
  if (!tryParseTransformedXML.success) {
    throw new NonConformingError(tryParseTransformedXML.error);
  }

  return tryParseTransformedXML.data;
}

export {
  TRANSFORMED_PARSED_XML_VALUE,
  type TransformedParsedXML,
  type TransformedParsedXMLValue,
  validateAndTransform,
};
