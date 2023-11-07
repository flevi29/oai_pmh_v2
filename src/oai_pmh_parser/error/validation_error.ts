import type { ParsedXML } from "../model/parsed_xml.ts";

export class ValidationError extends Error {
  override name = ValidationError.name;
  override cause: { rawXML: string; parsedXML?: ParsedXML };

  constructor(rawXML: string, parsedXML?: ParsedXML) {
    super(
      "received data does not conform to OAI-PMH 2.0 (http://www.openarchives.org/OAI/openarchivesprotocol.html)",
    );

    this.cause = { rawXML, parsedXML };
  }
}
