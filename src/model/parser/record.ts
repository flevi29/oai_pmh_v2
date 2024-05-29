import { parseOAIPMHResponseBase } from "./base_oai_pmh.ts";
import { parseToRecordOrString } from "../../parser/xml_parser.ts";
import { InnerValidationError } from "../../error/validation_error.ts";
import type { ParsedXMLElement } from "./xml.ts";
import { type OAIPMHHeader, parseHeader } from "./header.ts";
import {
  type ListResponse,
  parseResumptionToken,
  parseToNodeList,
} from "./shared.ts";

type OAIPMHRecord = {
  header: OAIPMHHeader;
  metadata?: NodeListOf<ChildNode>;
  about?: ParsedXMLElement[];
};

function parseRecord({ attr, value }: ParsedXMLElement): OAIPMHRecord {
  if (attr !== undefined || value === undefined) {
    // @TODO: This is not necessarily ListRecords
    throw new InnerValidationError(
      "expected <OAI-PMH><ListRecords><record> to have no attributes and not to be empty",
    );
  }

  const parseResult = parseToRecordOrString(value);

  if (parseResult instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListRecords><record> contents: ${parseResult.message}`,
    );
  }

  if (typeof parseResult !== "object") {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListRecords><record> node to have element child nodes",
    );
  }

  const { length } = Object.keys(parseResult);
  if (length < 1 || length > 3) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListRecords><record> node to only have 1-3 possible types of child node elements",
    );
  }

  const { header, metadata, about } = parseResult;

  if (header === undefined || header.length !== 1) {
    throw new InnerValidationError(
      "expected one of <OAI-PMH><ListRecords><record><header>",
    );
  }

  const parsedHeader = parseHeader(header[0]!);

  const oaiPMHRecord: OAIPMHRecord = { header: parsedHeader };

  if (parsedHeader instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListRecords><record><header>: ${parsedHeader.message}`,
    );
  }

  if (metadata !== undefined) {
    const parsedMetadata = parseToNodeList(metadata);

    if (parsedMetadata instanceof Error) {
      throw new InnerValidationError(`todo: ${parsedMetadata.message}`);
    }

    oaiPMHRecord.metadata = parsedMetadata;
  }

  if (about !== undefined) {
    oaiPMHRecord.about = about;
  }

  return oaiPMHRecord;
}

function parseGetRecordResponse(
  childNodeList: NodeListOf<ChildNode>,
): OAIPMHRecord {
  const getRecord = parseOAIPMHResponseBase(childNodeList, "GetRecord");

  const parseResult = parseToRecordOrString(getRecord);

  if (parseResult instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><GetRecord>: ${parseResult.message}`,
    );
  }

  if (typeof parseResult !== "object") {
    throw new InnerValidationError(
      "expected <OAI-PMH><GetRecord> node to have element child nodes",
    );
  }

  if (Object.keys(parseResult).length !== 1) {
    throw new InnerValidationError(
      "expected <OAI-PMH><GetRecord> to have only 1 possible type of element child node",
    );
  }

  const { record } = parseResult;
  if (record === undefined || record.length !== 1) {
    throw new InnerValidationError(
      "expected <OAI-PMH><GetRecord><record> to exist and be only one of",
    );
  }

  return parseRecord(record[0]!);
}

function parseListRecordsResponse(
  childNodeList: NodeListOf<ChildNode>,
): ListResponse<OAIPMHRecord> {
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

  const { record, resumptionToken } = parseResult,
    parsedResumptionToken = parseResumptionToken(resumptionToken);

  if (parsedResumptionToken instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListRecords><resumptionToken>: ${parsedResumptionToken.message}`,
    );
  }

  if (record === undefined) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListRecords> to have <record> element child nodes",
    );
  }

  return {
    records: record.map(parseRecord),
    resumptionToken: parsedResumptionToken,
  };
}

export { type OAIPMHRecord, parseGetRecordResponse, parseListRecordsResponse };
