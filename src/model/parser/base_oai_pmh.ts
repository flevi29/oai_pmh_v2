import { InnerValidationError } from "../../error/validation_error.ts";
import { parseToRecordOrString } from "../../parser/xml_parser.ts";
import { validateAndGetOAIPMHErrorResponse } from "./error.ts";

function validateOAIPMHResponseBaseAndGetValue(
  childNodeList: NodeListOf<ChildNode>,
): NodeListOf<ChildNode> {
  const result = parseToRecordOrString(childNodeList);

  if (result instanceof Error) {
    throw new InnerValidationError(
      `error parsing base XML contents: ${result.message}`,
    );
  }

  if (typeof result !== "object") {
    throw new InnerValidationError(
      "expected base XML to have child nodes othen than text",
    );
  }

  const { "OAI-PMH": OAIPMH } = result;
  if (Object.keys(result).length !== 1 || OAIPMH === undefined) {
    throw new InnerValidationError(
      "expected base XML to have one <OAI-PMH> child node",
    );
  }

  const { value } = OAIPMH[0]!;
  if (value === undefined) {
    throw new InnerValidationError("expected <OAI-PMH> node not to be empty");
  }

  return value;
}

function validateOAIPMHResponseBaseValueAndGetValueOfKey(
  childNodeList: NodeListOf<ChildNode>,
  key: string,
): NodeListOf<ChildNode> {
  const oaiPMH = validateOAIPMHResponseBaseAndGetValue(childNodeList);

  const result = parseToRecordOrString(oaiPMH);

  if (result instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH> contents: ${result.message}`,
    );
  }

  if (typeof result !== "object") {
    throw new InnerValidationError(
      "expected <OAI-PMH> node to have child nodes other than text",
    );
  }

  if (Object.keys(result).length !== 3) {
    throw new InnerValidationError(
      "expected <OAI-PMH> node to have 3 child nodes",
    );
  }

  const { [key]: responseValue, error, request, responseDate } = result;

  if (error !== undefined) {
    throw validateAndGetOAIPMHErrorResponse(error, request, responseDate);
  }

  if (responseValue === undefined || responseValue.length !== 1) {
    throw new InnerValidationError(
      `expected one of <OAI-PMH><${key}> node to exist`,
    );
  }

  const { value } = responseValue[0]!;
  if (value === undefined) {
    throw new InnerValidationError(
      `expected <OAI-PMH><${key}> node to not be empty`,
    );
  }

  return value;
}

export { validateOAIPMHResponseBaseValueAndGetValueOfKey };
