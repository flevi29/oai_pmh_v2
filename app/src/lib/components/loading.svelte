<script lang="ts">
  const { isLoading = true }: { isLoading?: boolean } = $props();
</script>

<div
  class="inline-flex size-11 items-center justify-center text-sm text-gray-800"
>
  <div
    class="size-4 animate-spin rounded-full border-[3px] border-current border-t-transparent text-blue-600"
    class:invisible={!isLoading}
  ></div>
</div>
