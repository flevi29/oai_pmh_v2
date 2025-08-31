<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";
  const {
    class: cls,
    children,
    ...restOfProps
  }: HTMLAnchorAttributes = $props();
</script>

<a
  class={[
    "px-4 py-3 text-sm font-semibold text-blue-600 hover:text-blue-800",
    cls,
  ]}
  {...restOfProps}>{@render children?.()}</a
>
