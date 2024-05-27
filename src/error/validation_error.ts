class InnerValidationError extends Error {
  override name = "InnerValidationError";

  constructor(message: string) {
    super(message);
  }
}

class ValidationError extends Error {
  override name = "ValidationError";
  override cause: InnerValidationError;
  xml: string;

  constructor(error: InnerValidationError, xml: string) {
    super(
      error.message +
        "\n(hint: inspect `xml` property for the whole XML document)",
    );
    this.cause = error;
    this.xml = xml;
  }
}

export { InnerValidationError, ValidationError };
