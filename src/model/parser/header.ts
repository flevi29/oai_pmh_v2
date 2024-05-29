import {
  type ListResponse,
  parseKeyAsText,
  parseResumptionToken,
  parseTextNodeArray,
} from "./shared.ts";
import { InnerValidationError } from "../../error/validation_error.ts";
import { parseToRecordOrString } from "../../parser/xml_parser.ts";
import { parseOAIPMHResponseBase } from "./base_oai_pmh.ts";
import type { ParsedXMLElement } from "./xml.ts";

type OAIPMHHeader = {
  isDeleted?: true;
  identifier: string;
  datestamp: string;
  setSpec?: string[];
};

function parseHeader({ attr, value }: ParsedXMLElement): OAIPMHHeader {
  if (value === undefined) {
    // @TODO: This is not necessarily ListIdentifiers
    throw new InnerValidationError(
      "expected <OAI-PMH><ListIdentifiers><header> to not be empty",
    );
  }

  const parsedHeader = parseToRecordOrString(value);

  if (parsedHeader instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListIdentifiers><header> contents: ${parsedHeader.message}`,
    );
  }

  if (typeof parsedHeader !== "object") {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListIdentifiers><header> node to have element child nodes",
    );
  }

  const { length } = Object.keys(parsedHeader);
  if (length < 2 || length > 3) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListIdentifiers><header> to have only 2 or 3 possible types of element child nodes",
    );
  }

  const identifier = parseKeyAsText(parsedHeader, "identifier");

  if (identifier instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListIdentifiers><header><identifier>: ${identifier.message}`,
    );
  }

  const datestamp = parseKeyAsText(parsedHeader, "datestamp");

  if (datestamp instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListIdentifiers><header><datestamp>: ${datestamp.message}`,
    );
  }

  const oaiPMHHeader: OAIPMHHeader = { identifier, datestamp };

  const { setSpec } = parsedHeader;
  if (setSpec !== undefined) {
    const parsedSetSpec = parseTextNodeArray(setSpec);

    if (parsedSetSpec instanceof Error) {
      throw new InnerValidationError(
        `error parsing <OAI-PMH><ListIdentifiers><header><setSpec>: ${parsedSetSpec.message}`,
      );
    }

    oaiPMHHeader.setSpec = parsedSetSpec;
  }

  if (attr !== undefined) {
    const { status } = attr;
    if (Object.keys(attr).length !== 1 || status?.value !== "deleted") {
      throw new InnerValidationError(
        "expected <OAI-PMH><ListIdentifiers><header> attributes to potentially only have status with deleted value",
      );
    }

    oaiPMHHeader.isDeleted = true;
  }

  return oaiPMHHeader;
}

function parseListIdentifiersResponse(
  childNodeList: NodeListOf<ChildNode>,
): ListResponse<OAIPMHHeader> {
  const listIdentifiers = parseOAIPMHResponseBase(
    childNodeList,
    "ListIdentifiers",
  );

  const parseResult = parseToRecordOrString(listIdentifiers);

  if (parseResult instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListIdentifiers>: ${parseResult.message}`,
    );
  }

  if (typeof parseResult !== "object") {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListIdentifiers> node to have element child nodes",
    );
  }

  const { length } = Object.keys(parseResult);
  if (length < 1 || length > 2) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListIdentifiers> to have only 2 possible types of element child nodes",
    );
  }

  const { header, resumptionToken } = parseResult,
    parsedResumptionToken = parseResumptionToken(resumptionToken);

  if (parsedResumptionToken instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListIdentifiers><resumptionToken>: ${parsedResumptionToken.message}`,
    );
  }

  if (header === undefined) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListIdentifiers><header> element node(s) to exist",
    );
  }

  return {
    records: header.map(parseHeader),
    resumptionToken: parsedResumptionToken,
  };
}

export { type OAIPMHHeader, parseHeader, parseListIdentifiersResponse };
