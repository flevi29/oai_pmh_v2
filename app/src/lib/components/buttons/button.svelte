<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  const {
    class: cls,
    children,
    type = "button",
    ...restOfProps
  }: HTMLButtonAttributes = $props();
</script>

<button {type} class={["border", cls]} {...restOfProps}>
  {@render children?.()}
</button>
