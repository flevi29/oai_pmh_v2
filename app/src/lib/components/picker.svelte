<script
  lang="ts"
  generics="T extends object, TNameKey extends keyof T, TValueKey extends keyof T"
>
  import { OAI_PMH_RESULT_TYPE, type OAIPMHResult } from "$lib/oai-pmh-result";
  import Dialog from "$lib/components/dialog.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import Loading from "$lib/components/loading.svelte";
  import XMark from "$lib/components/svgs/x-mark.svelte";

  const {
    currentItem,
    setItem,
    result,
    resultNamePath,
    resultValuePath,
    run,
    abort,
    isRunning,
    isURLChangedSinceLastResult,
    dataName,
    dataRoute,
    routeName,
  }: {
    currentItem?: string;
    setItem: (value: string) => void;
    result: OAIPMHResult<T[]> | null;
    resultNamePath?: TNameKey;
    resultValuePath: TValueKey;
    run: () => void;
    abort: () => void;
    isRunning: boolean;
    isURLChangedSinceLastResult: boolean;
    dataName: string;
    dataRoute: string;
    routeName: string;
  } = $props();
  let dialogComponent = $state<ReturnType<typeof Dialog> | null>(null);

  function runConditionally(): void {
    if ((result === null || isURLChangedSinceLastResult) && !isRunning) {
      run();
    }
  }
</script>

<Dialog
  bind:this={dialogComponent}
  onclose={() => {
    if (isRunning) {
      abort();
    }
  }}
>
  <div class="mx-auto flex w-72 flex-col items-center gap-y-3 pt-10">
    <div class="self-end">
      <button
        class="rounded-full bg-gray-500/20 p-1 text-gray-800 hover:bg-gray-500/50"
        type="button"
        onclick={dialogComponent?.close}
      >
        <XMark />
      </button>
    </div>

    {#if isRunning}
      <div class="w-full rounded-lg bg-white p-2 text-center text-sm shadow-sm">
        <span>Fetching available {dataName} ...</span>
        <div class="mx-auto w-max">
          <Loading />
        </div>
      </div>
    {:else if result === null}
      impossible
    {:else if result.status === OAI_PMH_RESULT_TYPE.SUCCESS}
      <div class="min-w-52 rounded-lg bg-white p-1 shadow-md">
        {#each result.value as valueElement}
          {@const key = valueElement[resultNamePath ?? resultValuePath]}
          {@const value = valueElement[resultValuePath]}
          {#if typeof value === "string" && typeof key === "string"}
            {@const name = "metadata-format-picker"}
            {@const id = `${name}-${value}`}

            <label
              for={id}
              class="flex cursor-pointer items-center rounded-lg p-2.5 hover:bg-gray-100"
            >
              <input
                {id}
                type="radio"
                {name}
                class="shrink-0 cursor-pointer rounded-full border-gray-200 text-blue-600 focus:ring-blue-500"
                checked={value === currentItem}
                onclick={() => {
                  setItem(value);
                  dialogComponent?.close();
                }}
              />
              <span
                class="grow select-none pl-3 font-mono font-semibold text-gray-800"
                >{key}</span
              >
            </label>
          {:else}
            nukukuku error
          {/if}
        {/each}
      </div>
    {:else}
      <div
        class="w-full rounded-lg border border-red-500 bg-red-100 p-2 text-red-700 shadow-sm"
      >
        <span>
          Error fetching available {dataName}, check
          <a class="underline" href={dataRoute}>{routeName}</a> for more details.
        </span>
      </div>
    {/if}
  </div>
</Dialog>

<Button
  onclick={() => {
    if (dialogComponent !== null) {
      dialogComponent.showModal();
      runConditionally();
    }
  }}>{currentItem ?? dataName}</Button
>
