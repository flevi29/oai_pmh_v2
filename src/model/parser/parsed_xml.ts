type TupleOfTextAttribute = [{ "#text": string }];

type FXPParsedXML = Record<
  string,
  TupleOfTextAttribute | Record<string, string> | FXPParsedXML[]
>;

function isObjectTupleOfTextAttribute(
  // deno-lint-ignore ban-types
  value: {},
): value is TupleOfTextAttribute {
  if (!Array.isArray(value) || value.length !== 1) {
    return false;
  }

  const [v] = value;
  if (v == null) {
    return false;
  }

  const entries = Object.entries(v);
  if (entries.length !== 1) {
    return false;
  }

  const [key, val] = entries[0]!;
  return key === "#text" && typeof val === "string";
}

// deno-lint-ignore ban-types
function isObjectRecordOfStrings(value: {}): value is Record<string, string> {
  for (const val of Object.values(value)) {
    if (typeof val !== "string") {
      return false;
    }
  }

  return true;
}

function isFXPParsedXML(value: unknown): value is FXPParsedXML[] {
  if (!Array.isArray(value)) {
    return false;
  }

  for (const valueElement of value) {
    if (valueElement == null) {
      return false;
    }

    for (const objectValue of Object.values(valueElement)) {
      if (
        objectValue == null ||
        (!isObjectTupleOfTextAttribute(objectValue) &&
          !isObjectRecordOfStrings(objectValue) &&
          !isFXPParsedXML(objectValue))
      ) {
        return false;
      }
    }
  }

  return true;
}

type ParsedXMLRecordValue = {
  i: number;
  attr?: Record<string, string>;
  val?: string | ParsedXML;
};

type ParsedXML = Record<string, ParsedXMLRecordValue[]>;

function extractAttr(
  fxpParsedXML: FXPParsedXML,
): Record<string, string> | void {
  if (Object.hasOwn(fxpParsedXML, ":@")) {
    const attr = <Record<string, string>> fxpParsedXML[":@"];
    delete fxpParsedXML[":@"];
    return attr;
  }
}

function fxpParsedXMLtoParsedXML(
  fxpParsedXMLArray: FXPParsedXML[],
): ParsedXML | undefined {
  if (fxpParsedXMLArray.length === 0) {
    return;
  }

  const parsedXML: ParsedXML = {};

  for (let i = 0; i < fxpParsedXMLArray.length; i += 1) {
    const fxpParsedXMLElem = fxpParsedXMLArray[i]!;

    const attr = extractAttr(fxpParsedXMLElem);

    const fxpParsedXMLElemEntries = Object.entries(fxpParsedXMLElem);
    if (fxpParsedXMLElemEntries.length !== 1) {
      throw new Error(
        `invalid FXP parsed XML element, must only have one object entry besides attributes: ${
          JSON.stringify(
            { attr, fxpParsedXMLElem },
          )
        }`,
      );
    }

    const newEntry: ParsedXMLRecordValue = { i };
    if (attr !== undefined) {
      newEntry.attr = attr;
    }

    const [key, val] = fxpParsedXMLElemEntries[0]!;

    if (val.length === 1 && Object.hasOwn(val[0], "#text")) {
      newEntry.val = <string> val[0]["#text"];
    } else {
      const subTransformedParsedXML = fxpParsedXMLtoParsedXML(
        <FXPParsedXML[]> val,
      );
      if (subTransformedParsedXML !== undefined) {
        newEntry.val = subTransformedParsedXML;
      }
    }

    (parsedXML[key] ??= []).push(newEntry);
  }

  return parsedXML;
}

function validateAndGetParsedXML(value: unknown): ParsedXML | undefined {
  if (!isFXPParsedXML(value)) {
    return;
  }

  return fxpParsedXMLtoParsedXML(value);
}

export { type ParsedXML, type ParsedXMLRecordValue, validateAndGetParsedXML };
