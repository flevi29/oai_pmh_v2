import type { ListOptions, OAIPMHHeader } from "oai-pmh-2-js/mod";
import { omitAndPick } from "../../omit-and-pick";
import { getListResultStore } from "../list-result.svelte";
import { getListOptionsStores } from "../list-options.svelte";
import { oai } from "./oai-pmh.svelte";
import { getAbortController } from "../../abort-controller";

export const listIdentifiers = (() => {
    const [r, { run, abort }] = omitAndPick(
        getListResultStore<OAIPMHHeader>(),
        "run",
        "abort",
      ),
      ac = getAbortController();

    return {
      r,
      run(listOptions: ListOptions): void {
        run(() =>
          oai.oaiPMH?.listIdentifiers(listOptions, {
            init: { signal: ac.signal },
          }),
        );
      },
      abort(): void {
        abort(ac.abort);
      },
    };
  })(),
  fields = getListOptionsStores(3);
