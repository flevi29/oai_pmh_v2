<script lang="ts">
  import { parseChildNodeList, SOME_TYPE } from "$lib/parser";
  import ParsedXMLElementComponent from "./parsed-xml-element.svelte";

  const {
      value,
      collapseLimit,
      componentGroupID,
    }: { value: unknown; collapseLimit?: number; componentGroupID: symbol } =
      $props(),
    validatedValue = $derived(
      value instanceof NodeList
        ? parseChildNodeList(value as NodeListOf<ChildNode>)
        : null,
    );
</script>

{#if validatedValue === null}
  NodeListError
{:else}
  {#each validatedValue as v}
    {#if v.type === SOME_TYPE.TEXT}
      <span class="text-lime-600">{v.value}</span>
    {:else if v.type === SOME_TYPE.UNPARSED}
      <span class="text-gray-500">{v.value}</span>
    {:else if v.type === SOME_TYPE.ELEMENT}
      <ParsedXMLElementComponent
        value={v.value}
        {collapseLimit}
        {componentGroupID}
      />
    {:else if v.type === SOME_TYPE.ERROR}
      <span class="text-red-600">ERROR</span>
    {/if}
  {/each}
{/if}
