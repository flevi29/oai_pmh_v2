import { extractKeysAndValidate } from "./shared.ts";
import { validateOAIPMHResponseBaseValueAndGetValueOfKey } from "./base_oai_pmh.ts";
import { parseToRecordOrString } from "../../parser/xml_parser.ts";
import type { ParsedXMLElement } from "./xml.ts";
import { InnerValidationError } from "../../error/validation_error.ts";

type OAIPMHMetadataFormat = {
  metadataPrefix: string;
  schema: string;
  metadataNamespace: string;
};

function validateOAIPMHMetadataFormat({
  attr,
  value,
}: ParsedXMLElement): OAIPMHMetadataFormat {
  if (attr !== undefined || value === undefined) {
    throw new Error("todo");
  }

  const result = parseToRecordOrString(value);

  if (result instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListMetadataFormats><metadataFormat> contents: ${result.message}`,
    );
  }

  if (typeof result !== "object") {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListMetadataFormats><metadataFormat> node to have child nodes other than text",
    );
  }

  const extractResult = extractKeysAndValidate(
    result,
    "metadataPrefix",
    "schema",
    "metadataNamespace",
  );

  if (extractResult instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListMetadataFormats><metadataFormat> contents: ${extractResult.message}`,
    );
  }

  return extractResult;
}

function validateOAIPMHListMetadataFormatsResponse(
  childNodeList: NodeListOf<ChildNode>,
): OAIPMHMetadataFormat[] {
  const listMetadataFormats = validateOAIPMHResponseBaseValueAndGetValueOfKey(
    childNodeList,
    "ListMetadataFormats",
  );

  const parseResult = parseToRecordOrString(listMetadataFormats);

  if (parseResult instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListMetadataFormats>: ${parseResult.message}`,
    );
  }

  if (typeof parseResult !== "object") {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListMetadataFormats> node to have child nodes other than text",
    );
  }

  const { metadataFormat } = parseResult;
  if (Object.keys(parseResult).length !== 1 || metadataFormat === undefined) {
    throw new InnerValidationError(
      "expected one of <OAI-PMH><ListMetadataFormats><metadataFormat> node",
    );
  }

  const metadataFormatList: OAIPMHMetadataFormat[] = [];
  for (const metadataFormatElem of metadataFormat) {
    const validationResult = validateOAIPMHMetadataFormat(metadataFormatElem);

    metadataFormatList.push(validationResult);
  }

  return metadataFormatList;
}

export { type OAIPMHMetadataFormat, validateOAIPMHListMetadataFormatsResponse };
