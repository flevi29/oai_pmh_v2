<script lang="ts">
  import { page } from "$app/stores";
  import { pathnameContains } from "$lib/pathname-contains";
  import { setLastVisitedOaiPmhAction } from "$lib/stores/last-visited-oai-pmh-action";

  // @TODO: Consider that some part of this should be in routes, as it contains some extra logic
  const { navs }: { navs: [name: string, href: string][] } = $props();
</script>

<div class="flex">
  <div class="flex rounded-lg bg-gray-100 p-1 transition hover:bg-gray-200">
    <nav class="flex space-x-2">
      {#each navs as [name, href]}
        <a
          class="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-sm {pathnameContains(
            $page.url.pathname,
            href,
          )
            ? 'bg-white text-gray-700'
            : 'bg-transparent text-gray-500 hover:hover:text-blue-600 hover:text-gray-700'}"
          {href}
          onclick={() => setLastVisitedOaiPmhAction(href)}
        >
          {name}
        </a>
      {/each}
    </nav>
  </div>
</div>
