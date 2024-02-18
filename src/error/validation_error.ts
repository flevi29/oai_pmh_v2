import type { ParsedXML } from "../model/parser/parsed_xml.ts";

export class ValidationError extends Error {
  override readonly name = "ValidationError";
  override readonly cause: { rawXML: string; parsedXML?: ParsedXML };
  readonly response: Response;

  constructor(
    rawXML: string,
    parsedXML: ParsedXML | undefined,
    response: Response,
  ) {
    super(
      "received data does not conform to OAI-PMH 2.0 (http://www.openarchives.org/OAI/openarchivesprotocol.html)",
    );

    this.cause = { rawXML, parsedXML };
    this.response = response;
  }
}
