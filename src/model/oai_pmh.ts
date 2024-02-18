import type { OAIPMHResponseError } from "../error/oai_pmh_response_error.ts";
import type { ValidationError } from "../error/validation_error.ts";
import type { UnexpectedStatusCodeError } from "../error/unexpected_status_code_error.ts";

type ListOptions = {
  from?: string;
  until?: string;
  set?: string;
  metadataPrefix: string;
};

type RequestOptions = {
  signal?: AbortSignal;
  retry?: number;
  retryInterval?: number;
};

type OAIPMHRequestConstructorOptions = {
  baseURL: URL | string;
  userAgent?: string;
  debugLogRetries?: boolean;
};

const STATUS = Object.freeze({
  OK: 0,
  OAI_PMH_ERROR: 1,
  VALIDATION_ERROR: 2,
  UNEXPECTED_STATUS_CODE_ERROR: 3,
  ABORTED: 4,
});
type Status = typeof STATUS;

type ParseResult<T = undefined> =
  | { status: Status["OK"]; value: T }
  | { status: Status["OAI_PMH_ERROR"]; value: OAIPMHResponseError }
  | { status: Status["VALIDATION_ERROR"]; value: ValidationError };

type RequestErrorResult =
  | {
    status: Status["UNEXPECTED_STATUS_CODE_ERROR"];
    value: UnexpectedStatusCodeError;
  }
  | {
    status: Status["ABORTED"];
    value: unknown;
  };

type RequestResult =
  | {
    status: Status["OK"];
    value: [xml: string, response: Response];
  }
  | RequestErrorResult;

type Result<T = undefined> = ParseResult<T> | RequestErrorResult;

export {
  type ListOptions,
  type OAIPMHRequestConstructorOptions,
  type ParseResult,
  type RequestOptions,
  type RequestResult,
  type Result,
  STATUS,
};
