import { parseKeyAsText } from "./shared.js";
import { parseOAIPMHResponseBase } from "./base_oai_pmh.js";
import { parseToRecordOrString } from "../../parser/xml_parser.js";
import type { ParsedXMLElement } from "./xml.js";
import { OAIPMHInnerValidationError } from "../../error/validation-error.js";

type OAIPMHMetadataFormat = {
  metadataPrefix: string;
  schema: string;
  metadataNamespace: string;
};

function validateMetadataFormat({
  attr,
  value,
}: ParsedXMLElement): OAIPMHMetadataFormat {
  if (attr !== undefined || value === undefined) {
    throw new OAIPMHInnerValidationError(
      "expected <OAI-PMH><ListMetadataFormats><metadataFormat> to have no attributes and not to be empty",
    );
  }

  const result = parseToRecordOrString(value);

  if (result instanceof Error) {
    throw new OAIPMHInnerValidationError(
      `error parsing <OAI-PMH><ListMetadataFormats><metadataFormat> contents: ${result.message}`,
    );
  }

  if (typeof result !== "object") {
    throw new OAIPMHInnerValidationError(
      "expected <OAI-PMH><ListMetadataFormats><metadataFormat> node to have element child nodes",
    );
  }

  const metadataPrefix = parseKeyAsText(result, "metadataPrefix");

  if (metadataPrefix instanceof Error) {
    throw new OAIPMHInnerValidationError(
      `error parsing <OAI-PMH><ListMetadataFormats><metadataFormat><metadataPrefix> contents: ${metadataPrefix.message}`,
    );
  }

  const schema = parseKeyAsText(result, "schema");

  if (schema instanceof Error) {
    throw new OAIPMHInnerValidationError(
      `error parsing <OAI-PMH><ListMetadataFormats><metadataFormat><schema> contents: ${schema.message}`,
    );
  }

  const metadataNamespace = parseKeyAsText(result, "metadataNamespace");

  if (metadataNamespace instanceof Error) {
    throw new OAIPMHInnerValidationError(
      `error parsing <OAI-PMH><ListMetadataFormats><metadataFormat><metadataNamespace> contents: ${metadataNamespace.message}`,
    );
  }

  return { metadataPrefix, schema, metadataNamespace };
}

function validateListMetadataFormatsResponse(
  childNodeList: NodeListOf<ChildNode>,
): OAIPMHMetadataFormat[] {
  const listMetadataFormats = parseOAIPMHResponseBase(
    childNodeList,
    "ListMetadataFormats",
  );

  const parseResult = parseToRecordOrString(listMetadataFormats);

  if (parseResult instanceof Error) {
    throw new OAIPMHInnerValidationError(
      `error parsing <OAI-PMH><ListMetadataFormats>: ${parseResult.message}`,
    );
  }

  if (typeof parseResult !== "object") {
    throw new OAIPMHInnerValidationError(
      "expected <OAI-PMH><ListMetadataFormats> node to have element child nodes",
    );
  }

  const { metadataFormat } = parseResult;
  if (Object.keys(parseResult).length !== 1 || metadataFormat === undefined) {
    throw new OAIPMHInnerValidationError(
      "expected <OAI-PMH><ListMetadataFormats> to have only <metadataFormat> element child nodes",
    );
  }

  return metadataFormat.map(validateMetadataFormat);
}

export { type OAIPMHMetadataFormat, validateListMetadataFormatsResponse };
