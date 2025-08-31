<script lang="ts">
  import JSONInner from "./json-inner.svelte";
  import ParsedXMLElementComponent from "$lib/components/parsed-xml-element.svelte";
  import NodeListComponent from "$lib/components/node-list.svelte";

  const {
    value,
    pXMLElemArrKey,
    nodeListKey,
    collapseLimit,
  }: {
    value: unknown;
    pXMLElemArrKey?: string;
    nodeListKey?: string;
    collapseLimit?: number;
  } = $props();
  const componentGroupID = Symbol();
</script>

{#if typeof value === "string"}
  <span class="text-lime-600">{value}</span>
{:else if typeof value === "boolean"}
  <span class="text-indigo-600">{String(value)}</span>
{:else if Array.isArray(value)}
  <span>&lbrack;</span>{#if value.length !== 0}
    <div class="pl-4">
      {#each value as valueElem, i}
        <div>
          <JSONInner value={valueElem} />{#if i !== value.length - 1},{/if}
        </div>
      {/each}
    </div>
  {/if}
  <span>&rbrack;</span>
{:else if typeof value === "object" && value !== null}
  {@const entries = Object.entries(value)}
  &lbrace;{#if entries.length !== 0}
    <div class="pl-4">
      {#each entries as [key, val]}
        <div>
          {#if pXMLElemArrKey !== null && pXMLElemArrKey === key}
            {#if Array.isArray(val)}
              {#each val as valElem}
                <ParsedXMLElementComponent
                  value={valElem}
                  {collapseLimit}
                  {componentGroupID}
                />
              {/each}
            {:else}
              error expected array
            {/if}
          {:else}
            <span class="mr-1"><span class="text-amber-700">{key}</span>:</span
            >{#if nodeListKey === key}
              &lbrace;<NodeListComponent
                value={val}
                {collapseLimit}
                {componentGroupID}
              />&rbrace;
            {:else}<JSONInner value={val} />
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  {/if}
  &rbrace;
{:else}
  <span class="text-red-600">ERROR: unhandled value type ({String(value)})</span
  >
{/if}
