import type { OAIPMHMetadataFormat } from "oai-pmh-2-js/mod";
import { oai } from "./oai-pmh.svelte";
import { omitAndPick } from "../../omit-and-pick";
import { getResultStore } from "../result.svelte";
import { getAbortController } from "../../abort-controller";

export const listMetadataFormats = (() => {
    const [r, { run }] = omitAndPick(
        getResultStore<OAIPMHMetadataFormat[]>(),
        "run",
      ),
      [ac, { abort }] = omitAndPick(getAbortController(), "abort");
    let lastURL = $state<string | null>(null);

    return {
      r,
      run(identifier?: string): void {
        return run(() => {
          lastURL = oai.url;
          return oai.oaiPMH?.listMetadataFormats(identifier, {
            init: { signal: ac.signal },
          });
        });
      },
      abort,
      get lastURL() {
        return lastURL;
      },
    };
  })(),
  fields = (() => {
    const identifierIndex = "2";

    let identifier = $state<string>(
      localStorage.getItem(identifierIndex) ?? "",
    );

    return {
      get identifier() {
        return identifier;
      },
      setIdentifier(value: string): void {
        identifier = value;
        localStorage.setItem(identifierIndex, value);
      },
    };
  })();
