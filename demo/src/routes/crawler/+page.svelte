<script lang="ts">
  import { Crawler } from "./crawler";

  const crawler = new Crawler(),
    { validURLs, isStartable, isTerimnatable } = crawler;

  function start() {
    crawler.startProcess();
  }

  function stop() {
    crawler.terminateProcess();
  }
</script>

<button type="button" disabled={!$isStartable} on:click={() => start()}
  >Start</button
>
<button type="button" disabled={!$isTerimnatable} on:click={() => stop()}
  >Stop</button
>

<div>
  {#if $validURLs !== undefined}
    {#each $validURLs as url}
      <div><span>{url}</span></div>
    {/each}
  {:else}
    <span>no valid URLs to show</span>
  {/if}
</div>
