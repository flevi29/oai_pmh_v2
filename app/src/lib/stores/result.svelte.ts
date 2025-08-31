import { ABORT_SYMBOL } from "$lib/abort-controller";
import {
  OAI_PMH_RESULT_TYPE,
  OAIPMHResponseError,
  type OAIPMHResult,
} from "../oai-pmh-result";

export function getResultStore<T>() {
  let isRunning = $state<boolean>(false),
    result = $state<OAIPMHResult<T> | null>(null);

  return {
    get result() {
      return result;
    },
    run(getPromise: () => Promise<T> | void) {
      isRunning = true;
      const promise = getPromise();

      if (promise === undefined) {
        isRunning = false;
        return;
      }

      promise
        .then((value) => {
          result = { status: OAI_PMH_RESULT_TYPE.SUCCESS, value };
        })
        .catch((error) => {
          if (error !== ABORT_SYMBOL) {
            result =
              error instanceof OAIPMHResponseError
                ? { status: OAI_PMH_RESULT_TYPE.OAI_ERR, value: error }
                : { status: OAI_PMH_RESULT_TYPE.GEN_ERR, value: error };
          }
        })
        .finally(() => {
          isRunning = false;
        });
    },
    get isRunning() {
      return isRunning;
    },
  };
}
