import type { ListOptions, OAIPMHRecord } from "oai-pmh-2-js/mod";
import { omitAndPick } from "../../omit-and-pick";
import { getListResultStore } from "../list-result.svelte";
import { getListOptionsStores } from "../list-options.svelte";
import { oai } from "./oai-pmh.svelte";
import { getAbortController } from "../../abort-controller";

export const listRecords = (() => {
    const [r, { run, abort }] = omitAndPick(
        getListResultStore<OAIPMHRecord>(),
        "run",
        "abort",
      ),
      ac = getAbortController();

    return {
      r,
      run(listOptions: ListOptions): void {
        run(() =>
          oai.oaiPMH?.listRecords(listOptions, {
            init: { signal: ac.signal },
          }),
        );
      },
      abort(): void {
        abort(ac.abort);
      },
    };
  })(),
  fields = getListOptionsStores(7);
