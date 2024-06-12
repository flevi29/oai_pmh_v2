<script lang="ts">
  export let text: string,
    disabled: boolean = false;
</script>

<button
  {disabled}
  type="button"
  class="rounded-full border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold
  text-white enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
  on:click
>
  {text}
</button>
