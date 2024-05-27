import type { OAIPMHErrorCode } from "../model/parser/error.ts";
import type { TextNodeWithAttributes } from "../model/parser/shared.ts";

// TODO: rename?
type OAIPMHResponseErrorObject = { code: OAIPMHErrorCode; text?: string };
type OAIPMHResponseErrorData = {
  errors: OAIPMHResponseErrorObject[];
  request: TextNodeWithAttributes;
  responseDate: string;
};

class OAIPMHResponseError extends Error {
  override name = "OAIPMHResponseError";
  override cause: OAIPMHResponseErrorData;

  constructor(errorData: OAIPMHResponseErrorData) {
    super(
      "OAI-PMH provider returned error(s):" +
        errorData.errors
          .map(
            (v) => `\n\t${v.code}${v.text !== undefined ? `: ${v.text}` : ""}`,
          )
          .join(""),
    );

    this.cause = errorData;
  }
}

export {
  OAIPMHResponseError,
  type OAIPMHResponseErrorData,
  type OAIPMHResponseErrorObject,
};
