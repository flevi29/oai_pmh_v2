<script lang="ts">
  const { class: svgClass = "size-6" }: { class?: string } = $props();
</script>

<svg
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  class={svgClass}
  viewBox="0 0 24 24"
>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M15.75 5.25v13.5m-7.5-13.5v13.5"
  />
</svg>
