<script lang="ts">
  import { Crawler } from "./crawler";

  const crawler = new Crawler(),
    { validURLs, isBusy, concurrentValidations } = crawler;

  function start() {
    crawler.start();
  }

  function stop() {
    crawler.stop().catch(console.warn);
  }
</script>

<button type="button" disabled={$isBusy} on:click={() => start()}
  >Start</button
>
<button type="button" disabled={!$isBusy} on:click={() => stop()}>Stop</button>

{#if $concurrentValidations !== 0}
  <div>
    <span
      >concurrent validations running: ~{$concurrentValidations}</span
    >
  </div>
{/if}

<div>
  {#if $validURLs !== null}
    {#each $validURLs as url}
      <div><span>{url}</span></div>
    {/each}
  {:else}
    <span>no valid URLs to show</span>
  {/if}
</div>
