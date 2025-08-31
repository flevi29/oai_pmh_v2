import { OAIPMHInnerValidationError } from "../../error/validation-error.js";
import { parseToRecordOrString } from "../../parser/xml_parser.js";
import { validateAndGetOAIPMHErrorResponse } from "./error.js";

function validateOAIPMHResponseBaseAndGetValue(
  childNodeList: NodeListOf<ChildNode>,
): NodeListOf<ChildNode> {
  const result = parseToRecordOrString(childNodeList);

  if (result instanceof Error) {
    throw new OAIPMHInnerValidationError(
      `error parsing base XML contents: ${result.message}`,
    );
  }

  if (typeof result !== "object") {
    throw new OAIPMHInnerValidationError(
      "expected base XML to have child nodes othen than text",
    );
  }

  const { "OAI-PMH": OAIPMH } = result;
  if (Object.keys(result).length !== 1 || OAIPMH === undefined) {
    throw new OAIPMHInnerValidationError(
      "expected base XML to have one <OAI-PMH> child node",
    );
  }

  const { value } = OAIPMH[0]!;
  if (value === undefined) {
    throw new OAIPMHInnerValidationError(
      "expected <OAI-PMH> node not to be empty",
    );
  }

  return value;
}

function parseOAIPMHResponseBase(
  childNodeList: NodeListOf<ChildNode>,
  key: string,
): NodeListOf<ChildNode> {
  const oaiPMH = validateOAIPMHResponseBaseAndGetValue(childNodeList);

  const parseResult = parseToRecordOrString(oaiPMH);

  if (parseResult instanceof Error) {
    throw new OAIPMHInnerValidationError(
      `error parsing <OAI-PMH> contents: ${parseResult.message}`,
    );
  }

  if (typeof parseResult !== "object") {
    throw new OAIPMHInnerValidationError(
      "expected <OAI-PMH> node to have child nodes other than text",
    );
  }

  if (Object.keys(parseResult).length !== 3) {
    throw new OAIPMHInnerValidationError(
      "expected <OAI-PMH> node to have 3 child nodes",
    );
  }

  const { [key]: responseValue, error } = parseResult;

  if (error !== undefined) {
    throw validateAndGetOAIPMHErrorResponse(error, parseResult);
  }

  if (responseValue === undefined || responseValue.length !== 1) {
    throw new OAIPMHInnerValidationError(
      `expected one of <OAI-PMH><${key}> node to exist`,
    );
  }

  const { value } = responseValue[0]!;
  if (value === undefined) {
    throw new OAIPMHInnerValidationError(
      `expected <OAI-PMH><${key}> node to not be empty`,
    );
  }

  return value;
}

export { parseOAIPMHResponseBase };
