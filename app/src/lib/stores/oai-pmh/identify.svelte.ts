import type { OAIPMHIdentify } from "oai_pmh_v2/mod";
import { oai } from "./oai-pmh.svelte";
import { omitAndPick } from "../../omit-and-pick";
import { getResultStore } from "../result.svelte";
import { getAbortController } from "../../abort-controller";

export const identify = (() => {
  const [r, { run }] = omitAndPick(getResultStore<OAIPMHIdentify>(), "run"),
    [ac, { abort }] = omitAndPick(getAbortController(), "abort");

  return {
    r,
    run(): void {
      return run(() => oai.oaiPMH?.identify({ init: { signal: ac.signal } }));
    },
    abort,
  };
})();
