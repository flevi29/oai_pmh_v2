<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { oai } from "$lib/stores/oai-pmh/oai-pmh.svelte";
  import { listSets } from "$lib/stores/oai-pmh/list-sets.svelte";
  import Picker from "$lib/components/picker.svelte";

  const props: Pick<
    ComponentProps<typeof Picker>,
    "currentItem" | "setItem" | "dataName" | "dataRoute" | "routeName"
  > = $props();
</script>

<Picker
  {...props}
  result={listSets.r.result}
  resultNamePath="setName"
  resultValuePath="setSpec"
  run={listSets.run}
  abort={listSets.abort}
  isRunning={listSets.r.isRunning}
  isURLChangedSinceLastResult={oai.url !== listSets.lastURL}
/>
