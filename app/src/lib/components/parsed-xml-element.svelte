<script module lang="ts">
  const countOfComponentsMap = new Map<symbol, number>();

  function increment(id: symbol): number {
    const currentCountPlusOne = (countOfComponentsMap.get(id) ?? 0) + 1;
    countOfComponentsMap.set(id, currentCountPlusOne);

    return currentCountPlusOne;
  }

  function decrement(id: symbol): void {
    const currentCountMinusOne = countOfComponentsMap.get(id)! - 1;

    if (currentCountMinusOne !== 0) {
      countOfComponentsMap.set(id, currentCountMinusOne);
    } else {
      countOfComponentsMap.delete(id);
    }
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { validateParsedXMLElement } from "../validate-parsed-xml-element";
  import NodeListComponent from "./node-list.svelte";
  import ParsedXMLAttributesComponent from "./parsed-xml-attributes.svelte";
  import MiniChevronDownComponent from "./svgs/mini-chevron-down.svelte";

  const {
    value,
    collapseLimit,
    componentGroupID,
  }: { value: unknown; collapseLimit?: number; componentGroupID: symbol } =
    $props();
  const v = $derived(validateParsedXMLElement(value));

  let isCollapsed = $state<boolean | undefined>(),
    thisCount = $state(NaN);

  $effect.pre(() => {
    const groupID = componentGroupID;
    untrack(() => {
      thisCount = increment(groupID);
    });
    return () => decrement(groupID);
  });

  $effect.pre(() => {
    if (collapseLimit !== undefined && thisCount > collapseLimit) {
      untrack(() => {
        if (isCollapsed === undefined) {
          isCollapsed = true;
        }
      });
    }
  });
</script>

{#if v === null}
  nukukuku ERROR TODO
{:else}
  {@const prefixedName = v.prefix ? `${v.prefix}:${v.name}` : v.name}
  {@const isValueDefined = v.value !== undefined}

  <div>
    <button
      type="button"
      class="group flex w-max select-text items-center"
      class:cursor-default={!isValueDefined}
      onclick={() => {
        isCollapsed = !isCollapsed;
      }}
    >
      {#if isValueDefined}
        <div
          class="text-gray-400 group-hover:text-gray-800 {isCollapsed
            ? '-rotate-90'
            : ''}"
        >
          <MiniChevronDownComponent />
        </div>
      {:else}
        <div class="size-5"></div>
      {/if}

      <span class:cursor-text={!isValueDefined}
        >{#if v.prefix !== undefined}<span
            class="text-emerald-700 {isValueDefined
              ? 'group-hover:text-emerald-900'
              : ''}">{v.prefix}</span
          >:{/if}<span
          class="text-blue-700 {isValueDefined
            ? 'group-hover:text-blue-900'
            : ''}">{v.name}</span
        ></span
      >
    </button>

    <div class="flex" class:hidden={isCollapsed && isValueDefined}>
      <div class="w-5 shrink-0">
        {#if isValueDefined}
          <div
            class="mx-auto h-full w-[1px] bg-gradient-to-b from-gray-400 from-60%"
          ></div>
        {/if}
      </div>

      <div>
        {#if v.attr !== undefined}
          <div class="pl-2">
            <ParsedXMLAttributesComponent attr={v.attr} />
          </div>
        {/if}

        {#if isValueDefined}
          <div class="pl-2">
            <NodeListComponent
              value={v.value}
              {collapseLimit}
              {componentGroupID}
            />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
