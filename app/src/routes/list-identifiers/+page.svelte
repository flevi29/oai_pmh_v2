<script lang="ts">
  import { oai } from "$lib/stores/oai-pmh/oai-pmh.svelte";
  import {
    listIdentifiers,
    fields,
  } from "$lib/stores/oai-pmh/list-identifiers.svelte";
  import ButtonComponent from "$lib/components/buttons/button.svelte";
  import SimpleTextInput from "$lib/components/inputs/simple-text-input.svelte";
  import OAIPMHListComponent from "../oai-pmh-list.svelte";
  import Loading from "$lib/components/loading.svelte";
  import SetPicker from "../set-picker.svelte";
  import MetadataFormatPicker from "../metadata-format-picker.svelte";

  let listComponent = $state<ReturnType<typeof OAIPMHListComponent> | null>(
    null,
  );

  $effect(() => {
    if (oai.oaiPMH !== null) {
      //
    }
  });
</script>

<ButtonComponent
  onclick={() => {
    if (listComponent !== null) {
      listIdentifiers.r.isRunning
        ? listComponent.stopList()
        : listComponent.startList();
    }
  }}
  disabled={(oai.oaiPMH === null && !listIdentifiers.r.isRunning) ||
    listIdentifiers.r.isBeingStopped}
  >{listIdentifiers.r.isRunning ? "Stop" : "List"}</ButtonComponent
>

<Loading isLoading={listIdentifiers.r.isRunning} />

<SimpleTextInput
  value={fields.from}
  placeholder="from"
  onValueChanged={fields.setFrom}
/>

<SimpleTextInput
  value={fields.until}
  placeholder="until"
  onValueChanged={fields.setUntil}
/>

<SetPicker
  currentItem={fields.set || undefined}
  setItem={fields.setSet}
  dataName="sets"
  dataRoute="/list-sets"
  routeName="ListSets"
/>

<MetadataFormatPicker
  currentItem={fields.metadataPrefix || undefined}
  setItem={fields.setMetadataPrefix}
  dataName="metadata formats"
  dataRoute="/list-metadata-formats"
  routeName="ListMetadataFormats"
/>

<OAIPMHListComponent
  bind:this={listComponent}
  listFn={() =>
    listIdentifiers.run({
      from: fields.from || undefined,
      until: fields.until || undefined,
      set: fields.set || undefined,
      metadataPrefix: fields.metadataPrefix,
    })}
  abort={listIdentifiers.abort}
  isRunning={listIdentifiers.r.isRunning}
  isBeingStopped={listIdentifiers.r.isBeingStopped}
  result={listIdentifiers.r.result}
  maxValues={listIdentifiers.r.maxValues}
/>
