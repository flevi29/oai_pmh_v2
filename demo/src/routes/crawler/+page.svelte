<script lang="ts">
  import { onDestroy } from "svelte";
  import ButtonComponent from "$lib/components/button.svelte";
  import ButtonAlterComponent from "$lib/components/button-alter.svelte";
  import LoadingComponent from "$lib/components/loading.svelte";
  import { Crawler } from "./crawler";

  const crawler = new Crawler(),
    { validURLObjects, isStartable, isProcessing, isTerimnatable, urlsCount } =
      crawler;

  onDestroy(() => crawler.disconnectURLStore());
</script>

<div class="py-5">
  <div class="mx-auto max-w-[60rem] rounded-xl border p-6 shadow-sm">
    <div class="flex items-center gap-2 py-1">
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

      {#if $urlsCount === 0}
        <span class="border-l-4 border-neutral-300 p-2 text-gray-600"
          >All URLs have been validated. If you want to retry, please clear the
          list below.</span
        >
      {:else if $isProcessing}
        <LoadingComponent isLoading={$isProcessing} />
      {:else}
        <span class="border-l-4 border-neutral-300 p-2 text-gray-600"
          >{$urlsCount} URLs left to validate.</span
        >
      {/if}
    </div>

    <div>
      {#if $validURLObjects !== undefined && $validURLObjects.length !== 0}
        <div class="py-2">
          {#each $validURLObjects as validURLObject}
            <div
              class="group border-y border-dotted border-neutral-400 p-0.5 text-gray-800
              first:rounded-t-lg first:border-t-0 last:rounded-b-lg last:border-b-0 odd:bg-gray-50"
            >
              <!-- @TODO: This won't show on mobile -->
              <span class="text-lg"
                >{validURLObject.name}<span
                  class="hidden font-mono text-base text-gray-400 group-hover:inline"
                >
                  ({validURLObject.url})</span
                ></span
              >
            </div>
          {/each}
        </div>

        <div class="py-1">
          <ButtonAlterComponent
            text="Clear data and cache"
            on:click={() => crawler.clearURLs()}
          />
        </div>
      {:else}
        <span>no valid URLs to show</span>
      {/if}
    </div>
  </div>
</div>
