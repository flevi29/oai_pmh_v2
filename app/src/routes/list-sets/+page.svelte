<script lang="ts">
  import { oai } from "$lib/stores/oai-pmh/oai-pmh.svelte";
  import { listSets } from "$lib/stores/oai-pmh/list-sets.svelte";
  import ButtonComponent from "$lib/components/buttons/button.svelte";
  import OAIPMHListComponent from "../oai-pmh-list.svelte";
  import Loading from "$lib/components/loading.svelte";

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
      listSets.r.isRunning
        ? listComponent.stopList()
        : listComponent.startList();
    }
  }}
  disabled={(oai.oaiPMH === null && !listSets.r.isRunning) ||
    listSets.r.isBeingStopped}
  >{listSets.r.isRunning ? "Stop" : "List"}</ButtonComponent
>

<Loading isLoading={listSets.r.isRunning} />

<OAIPMHListComponent
  bind:this={listComponent}
  listFn={() => listSets.run()}
  abort={listSets.abort}
  isRunning={listSets.r.isRunning}
  isBeingStopped={listSets.r.isBeingStopped}
  result={listSets.r.result}
  valuesPerPage={10}
  pXMLElemArrKey="setDescription"
/>
