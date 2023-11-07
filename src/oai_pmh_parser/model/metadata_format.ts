import {
  isStringWithNoAttributeTuple,
  type OAIPMHBaseResponseSharedRecord,
  type StringWithNoAttributeTuple,
  validateOAIPMHBaseResponseAndGetValueOfKey,
} from "./shared.ts";
import type { ParsedXML, ParsedXMLRecordValue } from "./parsed_xml.ts";

type OAIPMHMetadataFormat = {
  i: number;
  val: {
    metadataPrefix: StringWithNoAttributeTuple;
    schema: StringWithNoAttributeTuple;
    metadataNamespace: StringWithNoAttributeTuple;
  };
};

function isOAIPMHMetadataFormat(
  value: ParsedXMLRecordValue,
): value is OAIPMHMetadataFormat {
  const { val, attr } = value;

  if (
    attr !== undefined ||
    val === undefined ||
    typeof val === "string" ||
    Object.keys(val).length !== 3
  ) {
    return false;
  }

  const { metadataPrefix, schema, metadataNamespace } = val;

  return (
    metadataPrefix !== undefined &&
    isStringWithNoAttributeTuple(metadataPrefix) &&
    schema !== undefined &&
    isStringWithNoAttributeTuple(schema) &&
    metadataNamespace !== undefined &&
    isStringWithNoAttributeTuple(metadataNamespace)
  );
}

type OAIPMHListMetadataFormatsResponse = OAIPMHBaseResponseSharedRecord & {
  ListMetadataFormats: [
    {
      i: number;
      val: { metadataFormat: OAIPMHMetadataFormat[] };
    },
  ];
};

function isOAIPMHListMetadataFormatsResponse(
  value: ParsedXML,
): value is OAIPMHListMetadataFormatsResponse {
  const ListMetadataFormats = validateOAIPMHBaseResponseAndGetValueOfKey(
    value,
    "ListMetadataFormats",
  );
  if (!ListMetadataFormats) {
    return false;
  }

  const { val, attr } = ListMetadataFormats[0]!;
  if (
    attr !== undefined ||
    val === undefined ||
    typeof val === "string" ||
    Object.keys(val).length !== 1
  ) {
    return false;
  }

  const { metadataFormat } = val;
  if (metadataFormat === undefined) {
    return false;
  }

  for (const metadataFormatElem of metadataFormat) {
    if (!isOAIPMHMetadataFormat(metadataFormatElem)) {
      return false;
    }
  }

  return true;
}

export { isOAIPMHListMetadataFormatsResponse, type OAIPMHMetadataFormat };
