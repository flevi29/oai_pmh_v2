<script lang="ts">
  import ButtonComponent from "$lib/components/button.svelte";
  import ButtonAlterComponent from "$lib/components/button-alter.svelte";
  import LoadingComponent from "$lib/components/loading.svelte";
  import { onDestroy } from "svelte";
  import { Crawler } from "./crawler";

  const crawler = new Crawler(),
    { validURLs, isStartable, isProcessing, isTerimnatable } = crawler;

  onDestroy(() => crawler.disconnectURLStore());
</script>

<div class="mx-auto w-1/2 rounded-xl border p-6 shadow-sm">
  <div class="flex gap-2 py-1">
    <ButtonComponent
      text="Start"
      disabled={!$isStartable}
      on:click={() => crawler.startProcess()}
    />

    <ButtonAlterComponent
      text="Stop"
      disabled={!$isTerimnatable}
      on:click={() => crawler.terminateProcess()}
    />

    <LoadingComponent isLoading={$isProcessing} />
  </div>

  <div>
    {#if $validURLs !== undefined && $validURLs.length !== 0}
      <div class="py-2 font-mono">
        {#each $validURLs as url}
          <div
            class="border-y border-dotted border-neutral-400 first:border-t-0 last:border-b-0"
          >
            {url}
          </div>
        {/each}
      </div>

      <div class="py-1">
        <ButtonAlterComponent
          text="Clear cache and URLs"
          on:click={() => crawler.clearURLs()}
        />
      </div>
    {:else}
      <span>no valid URLs to show</span>
    {/if}
  </div>
</div>
