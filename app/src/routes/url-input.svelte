<script lang="ts">
  import { oai } from "$lib/stores/oai-pmh/oai-pmh.svelte";
  import DebouncedTextInput from "$lib/components/inputs/debounced-text-input.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import MicroAlert from "$lib/components/svgs/micro-alert.svelte";
  import LinkSvg from "$lib/components/svgs/link-svg.svelte";
  import TriangleDownSvg from "$lib/components/svgs/triangle-down-svg.svelte";

  let { isInURLSelectionMode = false }: { isInURLSelectionMode?: boolean } =
    $props();

  const isURLValid = $derived(oai.url === "" || oai.oaiPMH !== null);
</script>

<div class:hidden={isInURLSelectionMode}>
  <div class="flex">
    <details>
      <summary
        class="border-light-silver-lighter active:bg-bright-gray-huh hover:bg-anti-flash-white-huh
        bg-ghost-white text-charleston-green shadow-resting-small shadow-dark-gunmetal/5 outline-true-blue transition-button ease-something-input inline-flex h-8
        min-w-max cursor-pointer select-none items-center gap-1 break-words rounded-l-md
        border px-3 text-sm font-medium
        duration-75 focus-visible:outline-2 active:transition-none"
      >
        <span>Select URL</span>

        <TriangleDownSvg class="-mr-1 size-4" />
      </summary>

      <details-menu>huh</details-menu>
    </details>

    <div class="text-dim-gray relative w-full">
      <DebouncedTextInput
        class="border-light-silver bg-ghost-white shadow-inset-resting-small shadow-dark-gunmetal/5 transition-button ease-something-input focus:shadow-input-focus focus-visible:border-true-blue focus-visible:shadow-true-blue
        block w-full break-words rounded-r-md border py-[5px]
        pl-8 pr-3 align-middle text-sm duration-75
        focus:bg-white focus-visible:outline-none"
        placeholder="OAI-PMH URL here..."
        value={oai.url}
        onValueChanged={oai.setURL}
      />

      <LinkSvg class="pointer-events-none absolute left-2 top-[9px] size-4" />
    </div>

    <!-- <div class="whitespace-nowrap">
      <Button
        text="Select URL"
        onclick={() => {
          isInURLSelectionMode = true;
        }}
      />
    </div> -->
  </div>

  {#if !isURLValid}
    <span class="text-amaranth-red mt-2 pl-3 text-xs font-semibold">
      <MicroAlert class="inline-block size-3" />
      <span>Please enter a valid URL</span>
    </span>
  {/if}
</div>

{#if isInURLSelectionMode}
  <div class="rounded-xl border p-6 shadow-sm">
    <Button
      onclick={() => {
        isInURLSelectionMode = false;
      }}>"Close"</Button
    >

    <div class="flex flex-col">
      <!-- {#each URL_LIST as { name, url }}
        {#if url !== oai.url}
          <button
            type="button"
            class="border"
            onclick={() => {
              oai.setURL(url);
              isInURLSelectionMode = false;
            }}>{name}</button
          >
        {/if}
      {/each} -->
    </div>
  </div>
{/if}
