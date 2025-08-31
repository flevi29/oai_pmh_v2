<script lang="ts">
  import { untrack } from "svelte";
  import { oai } from "$lib/stores/oai-pmh/oai-pmh.svelte";
  import { identify } from "$lib/stores/oai-pmh/identify.svelte";
  import PlayButton from "$lib/components/buttons/play-button.svelte";
  import JSONComponent from "$lib/components/json.svelte";
  import Loading from "$lib/components/loading.svelte";

  $effect(() => {
    if (oai.oaiPMH !== null) {
      untrack(() => {
        if (identify.r.isRunning) {
          identify.abort();
        }
      });
    }
  });
</script>

<PlayButton
  onclick={() => (identify.r.isRunning ? identify.abort() : identify.run())}
  disabled={oai.oaiPMH === null && !identify.r.isRunning}
  isPlaying={identify.r.isRunning}
  >{identify.r.isRunning ? "Stop" : "Run"}</PlayButton
>

<Loading isLoading={identify.r.isRunning} />

<JSONComponent
  result={identify.r.result}
  collapseLimit={100}
  pXMLElemArrKey="description"
/>
