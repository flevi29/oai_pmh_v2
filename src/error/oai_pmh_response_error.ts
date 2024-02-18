import type {
  OAIPMHErrorCode,
  OAIPMHErrorResponse,
} from "../model/parser/error.ts";

export class OAIPMHResponseError extends Error {
  override readonly name = "OAIPMHResponseError";
  override readonly cause: { code: OAIPMHErrorCode; text?: string }[];
  readonly response: Response;

  constructor({ error }: OAIPMHErrorResponse, response: Response) {
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
    this.response = response;
  }
}
