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
    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
  />
</svg>
