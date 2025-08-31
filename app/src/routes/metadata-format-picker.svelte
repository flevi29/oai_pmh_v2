<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { oai } from "$lib/stores/oai-pmh/oai-pmh.svelte";
  import { listMetadataFormats } from "$lib/stores/oai-pmh/list-metadata-formats.svelte";
  import Picker from "$lib/components/picker.svelte";

  const props: Pick<
    ComponentProps<typeof Picker>,
    "currentItem" | "setItem" | "dataName" | "dataRoute" | "routeName"
  > = $props();
</script>

<Picker
  {...props}
  result={listMetadataFormats.r.result}
  resultValuePath="metadataPrefix"
  run={listMetadataFormats.run}
  abort={listMetadataFormats.abort}
  isRunning={listMetadataFormats.r.isRunning}
  isURLChangedSinceLastResult={oai.url !== listMetadataFormats.lastURL}
/>
