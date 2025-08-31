<script lang="ts">
  import type { ComponentProps } from "svelte";
  import DebouncedTextInput from "./debounced-text-input.svelte";

  const props: Omit<
    ComponentProps<typeof DebouncedTextInput>,
    "class"
  > = $props();
</script>

<DebouncedTextInput
  {...props}
  class="rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
/>
