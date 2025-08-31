<script lang="ts">
  import { untrack } from "svelte";
  import { oai } from "$lib/stores/oai-pmh/oai-pmh.svelte";
  import { getRecord, fields } from "$lib/stores/oai-pmh/get-record.svelte";
  import ButtonComponent from "$lib/components/buttons/button.svelte";
  import SimpleTextInput from "$lib/components/inputs/simple-text-input.svelte";
  import JSONComponent from "$lib/components/json.svelte";
  import Loading from "$lib/components/loading.svelte";

  $effect(() => {
    if (oai.oaiPMH !== null) {
      untrack(() => {
        if (getRecord.r.isRunning) {
          getRecord.abort();
        }
      });
    }
  });
</script>

<ButtonComponent
  onclick={() =>
    getRecord.r.isRunning
      ? getRecord.abort()
      : getRecord.run(fields.identifier, fields.metadataPrefix)}
  disabled={oai.oaiPMH === null && !getRecord.r.isRunning}
  >{getRecord.r.isRunning ? "Stop" : "Run"}</ButtonComponent
>

<Loading isLoading={getRecord.r.isRunning} />

<SimpleTextInput
  value={fields.identifier}
  placeholder="identifier"
  onValueChanged={fields.setIdentifier}
/>

<SimpleTextInput
  value={fields.metadataPrefix}
  placeholder="metadataPrefix"
  onValueChanged={fields.setMetadataPrefix}
/>

<JSONComponent
  result={getRecord.r.result}
  collapseLimit={100}
  pXMLElemArrKey="about"
  nodeListKey="metadata"
/>
