<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Button from "./button.svelte";
  import Play from "../svgs/play-svg.svelte";
  import Pause from "../svgs/pause-svg.svelte";

  const {
    isPlaying,
    children,
    ...props
  }: ComponentProps<typeof Button> & { isPlaying: boolean } = $props();
</script>

<Button {...props}>
  {@render children?.()}
  {#if isPlaying}
    <Pause class="mr-1 inline-block size-4" />
  {:else}
    <Play class="mr-1 inline-block  size-4" />
  {/if}
</Button>
