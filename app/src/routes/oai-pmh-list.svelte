<script lang="ts">
  import { onDestroy, untrack, type ComponentProps } from "svelte";
  import { type OAIPMHResult, OAI_PMH_RESULT_TYPE } from "$lib/oai-pmh-result";
  import { oai } from "$lib/stores/oai-pmh/oai-pmh.svelte";
  import JSONComponent from "$lib/components/json.svelte";

  const {
    listFn,
    abort,
    isRunning,
    isBeingStopped,
    result,
    maxValues,
    ...jsonCompProps
  }: {
    listFn: () => void;
    abort: () => void;
    isRunning: boolean;
    isBeingStopped: boolean;
    result: OAIPMHResult<unknown[]> | null;
    maxValues?: number;
    pXMLElemArrKey?: string;
    nodeListKey?: string;
  } & Omit<ComponentProps<typeof JSONComponent>, "result"> = $props();

  function startList(): void {
    if (isRunning) {
      console.error(new Error("already running"));
      return;
    }

    listFn();
  }

  function stopList(): void {
    if (isBeingStopped) {
      console.error(new Error("already being stopped"));
      return;
    }

    if (!isRunning) {
      console.error(new Error("not running"));
      return;
    }

    abort();
  }

  $effect(() => {
    if (
      result?.status === OAI_PMH_RESULT_TYPE.SUCCESS &&
      result.value.length === maxValues
    ) {
      untrack(() => {
        if (isRunning && !isBeingStopped) {
          stopList();
        }
      });
    }
  });

  $effect(() => {
    listFn;
    oai.url;

    untrack(() => {
      if (isRunning && !isBeingStopped) {
        stopList();
      }
    });
  });

  onDestroy(() => {
    if (isRunning && !isBeingStopped) {
      stopList();
    }
  });

  export { startList, stopList };
</script>

<JSONComponent {result} {...jsonCompProps} />
