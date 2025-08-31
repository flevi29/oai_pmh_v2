import type { OAIPMHSet } from "oai_pmh_v2/mod";
import { omitAndPick } from "$lib/omit-and-pick";
import { getListResultStore } from "../list-result.svelte";
import { oai } from "./oai-pmh.svelte";
import { getAbortController } from "../../abort-controller";

export const listSets = (() => {
  const [r, { run, abort }] = omitAndPick(
      getListResultStore<OAIPMHSet>(),
      "run",
      "abort",
    ),
    ac = getAbortController();
  let lastURL = $state<string | null>(null);

  return {
    r,
    run(): void {
      run(() => {
        lastURL = oai.url;
        return oai.oaiPMH?.listSets({ init: { signal: ac.signal } });
      });
    },
    abort(): void {
      abort(ac.abort);
    },
    get lastURL() {
      return lastURL;
    },
  };
})();
