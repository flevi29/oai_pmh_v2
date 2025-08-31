<script lang="ts">
  import { untrack } from "svelte";
  import { oai } from "$lib/stores/oai-pmh/oai-pmh.svelte";
  import {
    listMetadataFormats,
    fields,
  } from "$lib/stores/oai-pmh/list-metadata-formats.svelte";
  import ButtonComponent from "$lib/components/buttons/button.svelte";
  import SimpleTextInputComponent from "$lib/components/inputs/simple-text-input.svelte";
  import JSONComponent from "$lib/components/json.svelte";
  import Loading from "$lib/components/loading.svelte";

  $effect(() => {
    if (oai.oaiPMH !== null) {
      untrack(() => {
        if (listMetadataFormats.r.isRunning) {
          listMetadataFormats.abort();
        }
      });
    }
  });
</script>

<ButtonComponent
  onclick={() =>
    listMetadataFormats.r.isRunning
      ? listMetadataFormats.abort()
      : listMetadataFormats.run()}
  disabled={oai.oaiPMH === null && !listMetadataFormats.r.isRunning}
  >{listMetadataFormats.r.isRunning ? "Stop" : "Run"}</ButtonComponent
>

<Loading isLoading={listMetadataFormats.r.isRunning} />

<SimpleTextInputComponent
  value={fields.identifier}
  placeholder="identifier"
  onValueChanged={fields.setIdentifier}
/>

<JSONComponent result={listMetadataFormats.r.result} valuesPerPage={10} />
