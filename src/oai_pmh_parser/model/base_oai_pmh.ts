import type { ParsedXML } from "./parsed_xml.ts";

type OAIPMHBaseResponse = {
  "OAI-PMH": [
    {
      i: number;
      val: ParsedXML;
      attr: {
        "@_xmlns": string;
        "@_xmlns:xsi": string;
        "@_xsi:schemaLocation": string;
      };
    },
  ];
};

function isOAIPMHBaseResponse(value: ParsedXML): value is OAIPMHBaseResponse {
  const { "OAI-PMH": OAIPMH } = value;
  if (
    OAIPMH === undefined ||
    OAIPMH.length !== 1 ||
    Object.keys(value).length !== 1
  ) {
    return false;
  }

  const { val, attr } = OAIPMH[0]!;

  if (attr === undefined) {
    return false;
  }

  const {
    "@_xmlns": xmlns,
    "@_xmlns:xsi": xmlnsXSI,
    "@_xsi:schemaLocation": xsiSchemaLocation,
  } = attr;

  return (
    val !== undefined &&
    typeof val !== "string" &&
    xmlns !== undefined &&
    xmlnsXSI !== undefined &&
    xsiSchemaLocation !== undefined
  );
}

export { isOAIPMHBaseResponse };
