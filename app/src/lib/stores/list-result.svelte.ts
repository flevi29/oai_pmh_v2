import {
  OAI_PMH_RESULT_TYPE,
  OAIPMHResponseError,
  type OAIPMHResult,
} from "../oai-pmh-result";
import { ABORT_SYMBOL } from "../abort-controller";

export function getListResultStore<T>(initialMaxValues?: number) {
  let isRunning = $state(false);
  let isBeingStopped = $state(false);
  let maxValues = $state(initialMaxValues);
  let uncutResult = $state<OAIPMHResult<T[]> | null>(null);

  const result = $derived(
    maxValues !== undefined &&
      uncutResult?.status === OAI_PMH_RESULT_TYPE.SUCCESS &&
      uncutResult.value.length > maxValues
      ? { ...uncutResult, value: uncutResult.value.slice(0, maxValues) }
      : uncutResult,
  );

  function pushValues(values: T[]): void {
    if (uncutResult?.status !== OAI_PMH_RESULT_TYPE.SUCCESS) {
      uncutResult = { status: OAI_PMH_RESULT_TYPE.SUCCESS, value: [] };
    }

    uncutResult.value.push(...values);
  }

  return {
    get result() {
      return result;
    },
    run(getGenerator: () => AsyncGenerator<T[], void> | void) {
      isRunning = true;

      // TODO: Does this stop instantly? Do we really need `isBeingStopped`?
      (async () => {
        const generator = getGenerator();

        if (generator === undefined) {
          return;
        }

        for await (const items of generator) {
          pushValues(items);
        }
      })()
        .catch((error) => {
          debugger;
          if (error !== ABORT_SYMBOL) {
            uncutResult =
              error instanceof OAIPMHResponseError
                ? { status: OAI_PMH_RESULT_TYPE.OAI_ERR, value: error }
                : { status: OAI_PMH_RESULT_TYPE.GEN_ERR, value: error };
          }
        })
        .finally(() => {
          isRunning = false;
          isBeingStopped = false;
        });
    },
    abort(abortCallback: () => void): void {
      isBeingStopped = true;
      abortCallback();
    },
    get isRunning() {
      return isRunning;
    },
    get isBeingStopped() {
      return isBeingStopped;
    },
    get maxValues() {
      return maxValues;
    },
    setMaxValues(value?: number): void {
      maxValues = value;
    },
  };
}
