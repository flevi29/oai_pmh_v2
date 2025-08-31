import type { ParsedXMLElement } from "./xml.js";
import { OAIPMHInnerValidationError } from "../../error/validation-error.js";
import { parseToRecordOrString } from "../../parser/xml_parser.js";
import { parseOAIPMHResponseBase } from "./base_oai_pmh.js";
import { parseKeyAsText, parseTextNodeArray } from "./shared.js";

type OAIPMHIdentify = {
  repositoryName: string;
  baseURL: string;
  protocolVersion: string;
  earliestDatestamp: string;
  deletedRecord: "no" | "transient" | "persistent";
  granularity: "YYYY-MM-DD" | "YYYY-MM-DDThh:mm:ssZ";
  adminEmail: string;
  compression?: string[];
  description?: ParsedXMLElement[];
};

function parseIdentifyResponse(
  childNodeList: NodeListOf<ChildNode>,
): OAIPMHIdentify {
  const identify = parseOAIPMHResponseBase(childNodeList, "Identify");

  const parseResult = parseToRecordOrString(identify);

  if (parseResult instanceof Error) {
    throw new OAIPMHInnerValidationError(
      `error parsing <OAI-PMH><Identify>: ${parseResult.message}`,
    );
  }

  if (typeof parseResult !== "object") {
    throw new OAIPMHInnerValidationError(
      "expected <OAI-PMH><Identify> node to have element child nodes",
    );
  }

  const { length } = Object.keys(parseResult);
  if (length < 7 || length > 9) {
    throw new OAIPMHInnerValidationError(
      "expected <OAI-PMH><Identify> to have only 7 to 9 possible types of element child nodes",
    );
  }

  const repositoryName = parseKeyAsText(parseResult, "repositoryName");

  if (repositoryName instanceof Error) {
    throw new OAIPMHInnerValidationError("todo");
  }

  const baseURL = parseKeyAsText(parseResult, "baseURL");

  if (baseURL instanceof Error) {
    throw new OAIPMHInnerValidationError("todo");
  }

  const protocolVersion = parseKeyAsText(parseResult, "protocolVersion");

  if (protocolVersion instanceof Error) {
    throw new OAIPMHInnerValidationError("todo");
  }

  const earliestDatestamp = parseKeyAsText(parseResult, "earliestDatestamp");

  if (earliestDatestamp instanceof Error) {
    throw new OAIPMHInnerValidationError("todo");
  }

  const deletedRecord = parseKeyAsText(parseResult, "deletedRecord");

  if (deletedRecord instanceof Error) {
    throw new OAIPMHInnerValidationError("todo");
  }

  if (
    deletedRecord !== "no" &&
    deletedRecord !== "transient" &&
    deletedRecord !== "persistent"
  ) {
    throw new OAIPMHInnerValidationError("todo");
  }

  const granularity = parseKeyAsText(parseResult, "granularity");

  if (granularity instanceof Error) {
    throw new OAIPMHInnerValidationError("todo");
  }

  if (granularity !== "YYYY-MM-DD" && granularity !== "YYYY-MM-DDThh:mm:ssZ") {
    throw new OAIPMHInnerValidationError("todo");
  }

  const adminEmail = parseKeyAsText(parseResult, "adminEmail");

  if (adminEmail instanceof Error) {
    throw new OAIPMHInnerValidationError("todo");
  }

  const oaiPMHIdentify: OAIPMHIdentify = {
    repositoryName,
    baseURL,
    protocolVersion,
    earliestDatestamp,
    deletedRecord,
    granularity,
    adminEmail,
  };

  const { compression, description } = parseResult;

  if (compression !== undefined) {
    const parsedCompression = parseTextNodeArray(compression);

    if (parsedCompression instanceof Error) {
      throw new OAIPMHInnerValidationError("todo");
    }

    oaiPMHIdentify.compression = parsedCompression;
  }

  if (description !== undefined) {
    oaiPMHIdentify.description = description;
  }

  return oaiPMHIdentify;
}

export { type OAIPMHIdentify, parseIdentifyResponse };
