<script lang="ts">
  import { tick, type ComponentProps } from "svelte";
  import { type OAIPMHResult, OAI_PMH_RESULT_TYPE } from "../oai-pmh-result";
  import { getPagination } from "../pagination.svelte";
  import JSONInnerComponent from "./json-inner.svelte";
  import NumberedPaginationComponent from "./numbered-pagination.svelte";
  import OAIPMHErrorComponent from "./oai-pmh-error.svelte";
  import GeneralOAIPMHErrorComponent from "./general-oai-pmh-error.svelte";
  import InformationCircle from "./svgs/information-circle.svelte";

  const {
      result,
      valuesPerPage = 5,
      collapseLimit = 10,
      pXMLElemArrKey,
      nodeListKey,
    }: {
      result: OAIPMHResult<unknown> | null;
      valuesPerPage?: number;
      collapseLimit?: number;
      pXMLElemArrKey?: string;
      nodeListKey?: string;
    } = $props(),
    pagination = $derived(
      result?.status === OAI_PMH_RESULT_TYPE.SUCCESS &&
        Array.isArray(result.value)
        ? getPagination(result.value, valuesPerPage)
        : null,
    );

  let topDivElement = $state<HTMLDivElement | null>(null);
</script>

{#snippet JSONInnerSnippet(props: ComponentProps<typeof JSONInnerComponent>)}
  <div
    class="border-b border-dotted border-gray-500 p-2 font-mono text-gray-700 first:rounded-t-xl
        last:rounded-b-xl last:border-b-0 hover:bg-gray-50/60"
  >
    <JSONInnerComponent {...props} />
  </div>
{/snippet}

<div bind:this={topDivElement}>
  <div class="break-all">
    {#if result === null}
      <div class="relative flex min-h-28 w-full items-center justify-center">
        <InformationCircle
          class="absolute inset-0 mx-auto size-28 text-gray-100/70"
        />

        <div class="relative size-max text-lg italic text-gray-400">
          <span>No results to show</span>
        </div>
      </div>
    {:else if pagination !== null}
      {#each pagination.valuesForCurrentPage as value}
        {@render JSONInnerSnippet({
          value,
          pXMLElemArrKey,
          nodeListKey,
          collapseLimit,
        })}
      {/each}
    {:else if result.status === OAI_PMH_RESULT_TYPE.SUCCESS}
      {@render JSONInnerSnippet({
        value: result.value,
        pXMLElemArrKey,
        nodeListKey,
        collapseLimit,
      })}
    {:else if result.status === OAI_PMH_RESULT_TYPE.OAI_ERR}
      <OAIPMHErrorComponent errorCause={result.value.cause} />
    {:else}
      <GeneralOAIPMHErrorComponent error={result.value} />
    {/if}
  </div>

  {#if pagination !== null && pagination.totalPages > 1}
    <div class="w-full pt-2">
      <div class="mx-auto w-min">
        <NumberedPaginationComponent
          pages={pagination.pages}
          page={pagination.page}
          totalPages={pagination.totalPages}
          setPage={(p) => {
            pagination.setPage(p);
            tick().then(() =>
              topDivElement?.scrollIntoView({
                block: "start",
                inline: "nearest",
                behavior: "smooth",
              }),
            );
          }}
        />
      </div>
    </div>
  {/if}
</div>
