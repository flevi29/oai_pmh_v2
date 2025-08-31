<script lang="ts">
  import ExclamationCircle from "./svgs/exclamation-circle.svelte";

  const { error }: { error: unknown } = $props();

  $effect(() => console.error(error));
</script>

<div
  class="relative rounded-lg border border-red-500 bg-red-100 p-4 text-red-800"
>
  <div class="absolute inset-0 size-full overflow-hidden text-red-200/50">
    <ExclamationCircle class="relative -left-7 -top-7 size-56" />
  </div>
  <div class="relative">
    {#if error instanceof Error}
      <span class="text-lg font-semibold">{error.name}</span>
      <br />
      <span>{error.message}</span>

      {#if error instanceof TypeError}
        <br />
        <span
          >It's possibly a <a
            class="font-medium underline decoration-1 hover:decoration-2"
            href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSMissingAllowOrigin"
            target="_blank"
            >"CORS header ‘Access-Control-Allow-Origin’ missing"</a
          > error, in which case the resrource at the URL is inaccessible from browser
          JavaScript code.
        </span>
        <!-- @TODO: Explain how they might choose another URL, URL crawler, and possibly CORS proxy -->
      {/if}
    {:else}
      <span>{JSON.stringify(error)}</span>
    {/if}

    <span class="text-sm">(check console for more details)</span>
  </div>
</div>
