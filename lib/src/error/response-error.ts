import type { OAIPMHErrorCode } from "../model/parser/error.js";
import type { TextNodeWithAttributes } from "../model/parser/shared.js";
import { OAIPMHError } from "./error.js";

export type OAIPMHResponseErrorData = { code: OAIPMHErrorCode; text?: string };
export type OAIPMHResponseErrorCause = {
  errors: OAIPMHResponseErrorData[];
  request: TextNodeWithAttributes;
  responseDate: string;
};

export class OAIPMHResponseError extends OAIPMHError {
  override name = "OAIPMHResponseError";
  override cause: OAIPMHResponseErrorCause;

  constructor(cause: OAIPMHResponseErrorCause) {
    super(
      "OAI-PMH provider returned error(s):" +
        cause.errors
          .map(
            (v) => `\n\t${v.code}${v.text !== undefined ? `: ${v.text}` : ""}`,
          )
          .join(""),
    );

    this.cause = cause;
  }
}
