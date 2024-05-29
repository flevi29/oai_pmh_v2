import { InnerValidationError } from "../../error/validation_error.ts";
import { parseToRecordOrString } from "../../parser/xml_parser.ts";
import { parseOAIPMHResponseBase } from "./base_oai_pmh.ts";
import {
  type ListResponse,
  parseKeyAsText,
  parseResumptionToken,
} from "./shared.ts";
import type { ParsedXMLElement } from "./xml.ts";

type OAIPMHSet = {
  setSpec: string;
  setName: string;
  setDescription?: ParsedXMLElement[];
};

function parseSet({ attr, value }: ParsedXMLElement): OAIPMHSet {
  if (attr !== undefined || value === undefined) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListSets><set> to not be empty and to have no attributes",
    );
  }

  const parsedSet = parseToRecordOrString(value);

  if (parsedSet instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListSets><set> contents: ${parsedSet.message}`,
    );
  }

  if (typeof parsedSet !== "object") {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListSets><set> node to have element child nodes",
    );
  }

  const { length } = Object.keys(parsedSet);
  if (length < 2 || length > 3) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListSets><set> to have only 2 or 3 possible types of element child nodes",
    );
  }

  const setSpec = parseKeyAsText(parsedSet, "setSpec");

  if (setSpec instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListSets><set><setSpec>: ${setSpec.message}`,
    );
  }

  const setName = parseKeyAsText(parsedSet, "setName");

  if (setName instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListSets><set><setName>: ${setName.message}`,
    );
  }

  const oaiPMHSet: OAIPMHSet = { setSpec, setName };

  const { setDescription } = parsedSet;
  if (setDescription !== undefined) {
    oaiPMHSet.setDescription = setDescription;
  }

  return oaiPMHSet;
}

function parseListSetsResponse(
  childNodeList: NodeListOf<ChildNode>,
): ListResponse<OAIPMHSet> {
  const listSets = parseOAIPMHResponseBase(childNodeList, "ListSets");

  const parseResult = parseToRecordOrString(listSets);

  if (parseResult instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListSets>: ${parseResult.message}`,
    );
  }

  if (typeof parseResult !== "object") {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListSets> node to have element child nodes",
    );
  }

  const { length } = Object.keys(parseResult);
  if (length < 1 || length > 2) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListSets> to have only 2 possible types of element child nodes",
    );
  }

  const { set, resumptionToken } = parseResult,
    parsedResumptionToken = parseResumptionToken(resumptionToken);

  if (parsedResumptionToken instanceof Error) {
    throw new InnerValidationError(
      `error parsing <OAI-PMH><ListSets><resumptionToken>: ${parsedResumptionToken.message}`,
    );
  }

  if (set === undefined) {
    throw new InnerValidationError(
      "expected <OAI-PMH><ListSets> to have <set> element child nodes",
    );
  }

  return {
    records: set.map(parseSet),
    resumptionToken: parsedResumptionToken,
  };
}

export { type OAIPMHSet, parseListSetsResponse };
