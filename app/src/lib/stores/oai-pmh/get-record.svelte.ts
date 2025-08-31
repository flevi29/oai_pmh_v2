import type { OAIPMHRecord } from "oai_pmh_v2/mod";
import { oai } from "./oai-pmh.svelte";
import { omitAndPick } from "../../omit-and-pick";
import { getResultStore } from "../result.svelte";
import { getAbortController } from "../../abort-controller";

export const getRecord = (() => {
    const [r, { run }] = omitAndPick(getResultStore<OAIPMHRecord>(), "run"),
      [ac, { abort }] = omitAndPick(getAbortController(), "abort");

    return {
      r,
      run(identifier: string, metadataPrefix: string): void {
        return run(() =>
          oai.oaiPMH?.getRecord(identifier, metadataPrefix, {
            init: { signal: ac.signal },
          }),
        );
      },
      abort,
    };
  })(),
  fields = (() => {
    const identifierIndex = "11",
      metadataPrefixIndex = "12";

    let identifier = $state<string>(
        localStorage.getItem(identifierIndex) ?? "",
      ),
      metadataPrefix = $state<string>(
        localStorage.getItem(metadataPrefixIndex) ?? "",
      );

    return {
      get identifier() {
        return identifier;
      },
      setIdentifier(value: string): void {
        identifier = value;
        localStorage.setItem(identifierIndex, value);
      },
      get metadataPrefix() {
        return metadataPrefix;
      },
      setMetadataPrefix(value: string): void {
        metadataPrefix = value;
        localStorage.setItem(metadataPrefixIndex, value);
      },
    };
  })();
