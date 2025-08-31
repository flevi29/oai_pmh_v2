<script lang="ts">
  import { oai } from "$lib/stores/oai-pmh/oai-pmh.svelte";
  import { listRecords, fields } from "$lib/stores/oai-pmh/list-records.svelte";
  import ButtonComponent from "$lib/components/buttons/button.svelte";
  import SimpleTextInputComponent from "$lib/components/inputs/simple-text-input.svelte";
  import Loading from "$lib/components/loading.svelte";
  import OAIPMHListComponent from "../oai-pmh-list.svelte";
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
      listRecords.r.isRunning
        ? listComponent.stopList()
        : listComponent.startList();
    }
  }}
  disabled={(oai.oaiPMH === null && !listRecords.r.isRunning) ||
    listRecords.r.isBeingStopped}
  >{listRecords.r.isRunning ? "Stop" : "List"}</ButtonComponent
>

<Loading isLoading={listRecords.r.isRunning} />

<SimpleTextInputComponent
  value={fields.from}
  placeholder="from"
  onValueChanged={fields.setFrom}
/>

<SimpleTextInputComponent
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
    listRecords.run({
      from: fields.from || undefined,
      until: fields.until || undefined,
      set: fields.set || undefined,
      metadataPrefix: fields.metadataPrefix,
    })}
  abort={listRecords.abort}
  isRunning={listRecords.r.isRunning}
  isBeingStopped={listRecords.r.isBeingStopped}
  result={listRecords.r.result}
  maxValues={listRecords.r.maxValues}
  valuesPerPage={3}
  pXMLElemArrKey="about"
  nodeListKey="metadata"
/>
