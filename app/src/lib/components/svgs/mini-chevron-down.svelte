<script lang="ts">
  const { class: svgClass = "size-5" }: { class?: string } = $props();
</script>

<svg fill="currentColor" class={svgClass} viewBox="0 0 20 20">
  <path
    fill-rule="evenodd"
    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
    clip-rule="evenodd"
  />
</svg>
