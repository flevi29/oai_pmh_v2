<script lang="ts">
  export let text: string,
    disabled: boolean = false;
</script>

<button
  {disabled}
  type="button"
  class="rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm
  enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
  on:click
>
  {text}
</button>
