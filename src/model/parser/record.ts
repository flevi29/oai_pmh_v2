import { parseOAIPMHResponseBase } from "./base_oai_pmh.ts";
import { parseToRecordOrString } from "../../parser/xml_parser.ts";
import { InnerValidationError } from "../../error/validation_error.ts";
import type { ParsedXMLElement } from "./xml.ts";

type SOAIPMHRecord = {};

function validateRecord({ attr, value }: ParsedXMLElement): SOAIPMHRecord {
  if (attr !== undefined || value === undefined) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListRecords><record> to have no attributes and not to be empty",
    );
  }

  const result = parseToRecordOrString(value);

  if (result instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListRecords><record> contents: ${result.message}`,
    );
  }

  if (typeof result !== "object") {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListRecords><record> node to have element child nodes",
    );
  }

  throw new InnerValidationError("unimplemented");
}

function validateListRecordsResponse(
  childNodeList: NodeListOf<ChildNode>,
): SOAIPMHRecord[] {
  const listRecords = parseOAIPMHResponseBase(childNodeList, "ListRecords");

  const parseResult = parseToRecordOrString(listRecords);

  if (parseResult instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListRecords>: ${parseResult.message}`,
    );
  }

  if (typeof parseResult !== "object") {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListRecords> node to have element child nodes",
    );
  }

  const { length } = Object.keys(parseResult);
  if (length < 1 || length > 2) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListRecords> to have only 2 possible types of element child nodes",
    );
  }

  const { record, resumptionToken } = parseResult;
  if (record === undefined) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListRecords> to have <record> element child nodes",
    );
  }

  if (resumptionToken !== undefined) {
    if (resumptionToken.length !== 1) {
      throw new Error("todo");
    }

    //
  }

  return record.map(validateRecord);
}

export { validateListRecordsResponse };
