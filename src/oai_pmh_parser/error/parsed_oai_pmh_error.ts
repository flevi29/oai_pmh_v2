import type { OAIPMHErrorCode, OAIPMHErrorResponse } from "../model/error.ts";

export class ParsedOAIPMHError extends Error {
  override name = ParsedOAIPMHError.name;
  override cause: { code: OAIPMHErrorCode; text?: string }[];

  constructor({ error }: OAIPMHErrorResponse) {
    const mappedErrors = error.map((v) => ({
      code: v.attr["@_code"],
      text: v.val,
    }));

    super(
      "OAI-PMH provider returned error(s):" +
        mappedErrors
          .map(
            (v) => `\n\t${v.code}${v.text !== undefined ? `: ${v.text}` : ""}`,
          )
          .join(""),
    );

    this.cause = mappedErrors;
  }
}
