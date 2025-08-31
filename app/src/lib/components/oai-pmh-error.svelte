<script lang="ts">
  import type { OAIPMHResponseErrorCause } from "oai_pmh_v2/mod";
  import ParsedXMLAttributesComponent from "./parsed-xml-attributes.svelte";
  import ExclamationTriangle from "./svgs/exclamation-triangle.svelte";

  const { errorCause }: { errorCause: OAIPMHResponseErrorCause } = $props();
</script>

<div
  class="relative rounded-lg border border-amber-500 bg-amber-100 p-4 text-amber-800"
>
  <div class="absolute inset-0 size-full overflow-hidden text-amber-200/40">
    <ExclamationTriangle class="relative -left-7 -top-8 size-48" />
  </div>

  <div class="relative">
    <div class="text-lg font-semibold">
      <span
        >OAI-PMH ERROR <span class="text-xs italic"
          >({errorCause.responseDate})</span
        ></span
      >
    </div>

    {#each errorCause.errors as error}
      <div>
        <span class="font-mono">{error.code}</span
        >{#if error.text !== undefined}<span class="pl-1">({error.text})</span
          >{/if}
      </div>
    {/each}

    <!-- @TODO: Maybe instead of using ParsedXMLAttributesComponent make a whole URL out of this -->
    <span>{errorCause.request.value}</span>
    {#if errorCause.request.attr !== undefined}
      <div class="font-mono font-medium">
        <ParsedXMLAttributesComponent attr={errorCause.request.attr} />
      </div>
    {/if}
  </div>
</div>
