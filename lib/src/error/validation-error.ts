import { OAIPMHError } from "./error.js";

export class OAIPMHInnerValidationError extends OAIPMHError {
  override name = "OAIPMHInnerValidationError";
}

export class OAIPMHValidationError extends OAIPMHError {
  override name = "OAIPMHValidationError";
  override cause: OAIPMHInnerValidationError;
  xml: string;

  constructor(error: OAIPMHInnerValidationError, xml: string) {
    super(
      error.message +
        "\n(hint: inspect `xml` property for the whole XML document)",
    );
    this.cause = error;
    this.xml = xml;
  }
}
