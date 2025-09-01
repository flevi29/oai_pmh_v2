import { OAIPMHResponseError } from "oai-pmh-2-js/mod";

export { OAIPMHResponseError };
export const OAI_PMH_RESULT_TYPE = Object.freeze({
  SUCCESS: 0,
  OAI_ERR: 1,
  GEN_ERR: 2,
});
export type OAIPMHResultType = typeof OAI_PMH_RESULT_TYPE;
export type OAIPMHResult<T> =
  | { status: OAIPMHResultType["SUCCESS"]; value: T }
  | { status: OAIPMHResultType["OAI_ERR"]; value: OAIPMHResponseError }
  | { status: OAIPMHResultType["GEN_ERR"]; value: unknown };
