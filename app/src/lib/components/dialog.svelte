<script module lang="ts">
  const BODY_CLASSES = ["blur-sm"];
  let countOpenDialogs = 0;

  function toggleBodyClassesConditionally() {
    if (countOpenDialogs === 0) {
      document.body.classList.remove(...BODY_CLASSES);
    } else if (countOpenDialogs === 1) {
      document.body.classList.add(...BODY_CLASSES);
    }
  }

  function increment() {
    countOpenDialogs += 1;
    toggleBodyClassesConditionally();
  }

  function decrement() {
    countOpenDialogs -= 1;
    toggleBodyClassesConditionally();
  }
</script>

<script lang="ts">
  import type { HTMLDialogAttributes } from "svelte/elements";

  const { children, onclose, ...restOfProps }: HTMLDialogAttributes = $props();

  let dialogElement = $state<HTMLDialogElement | null>(null);

  function close(): void {
    if (dialogElement !== null && dialogElement.open) {
      dialogElement.close();
    }
  }

  function showModal(): void {
    if (dialogElement !== null && !dialogElement.open) {
      dialogElement.showModal();
      increment();
    }
  }

  $effect(() => close);

  export { close, showModal };
</script>

<dialog
  class="m-0 h-screen max-h-none w-full max-w-none overflow-x-auto
  overscroll-contain bg-transparent backdrop:bg-blue-300/20 focus:outline-none"
  bind:this={dialogElement}
  onclose={(event) => {
    decrement();
    onclose?.(event);
  }}
  {...restOfProps}
>
  {@render children?.()}
</dialog>
