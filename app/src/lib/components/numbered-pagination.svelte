<script lang="ts">
  const {
    pages,
    page,
    totalPages,
    setPage,
  }: {
    pages: (number | null)[];
    page: number;
    totalPages: number;
    setPage: (page: number) => void;
  } = $props();
</script>

<nav class="flex items-center gap-x-1">
  <button
    type="button"
    class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center gap-x-2 rounded-lg border border-transparent px-2.5 py-2 text-sm
    text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
    disabled={page === 1}
    onclick={() => setPage(page - 1)}
  >
    <svg
      class="size-3.5 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m15 18-6-6 6-6"></path>
    </svg>
  </button>

  <div class="flex items-center gap-x-1">
    {#each pages as pageElem}
      {#if pageElem !== null}
        <button
          type="button"
          class="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg border px-3 py-2 text-sm
        text-gray-800 focus:bg-gray-50 focus:outline-none {page === pageElem
            ? 'border-gray-200'
            : 'border-transparent hover:bg-gray-100'}"
          onclick={() => {
            if (page !== pageElem) {
              setPage(pageElem);
            }
          }}
        >
          {pageElem}
        </button>
      {:else}
        <div
          class="flex min-h-[38px] min-w-[38px] select-none items-center justify-center rounded-lg p-2 text-sm
        text-gray-400 hover:bg-gray-100 focus:outline-none"
        >
          <span class="text-xs">•••</span>
        </div>
      {/if}
    {/each}
  </div>

  <button
    type="button"
    class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center gap-x-2 rounded-lg border border-transparent px-2.5
    py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
    disabled={page === totalPages}
    onclick={() => setPage(page + 1)}
  >
    <svg
      class="size-3.5 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m9 18 6-6-6-6"></path>
    </svg>
  </button>
</nav>
