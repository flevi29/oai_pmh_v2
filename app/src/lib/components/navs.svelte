<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import { setLastVisitedOaiPmhAction } from "$lib/stores/last-visited-oai-pmh-action";

  const {
    navigationObjects,
  }: {
    navigationObjects: [name: string, route: Parameters<typeof resolve>[0]][];
  } = $props();

  const resolvedNavigationObjects = $derived(
    navigationObjects.map(([name, route]) => {
      const resolvedPathname = resolve(route);

      return {
        name,
        resolvedPathname,
        isActive: page.url.pathname.indexOf(resolvedPathname) === 0,
      };
    }),
  );
</script>

<div class="flex">
  <div class="flex rounded-lg bg-gray-100 p-1 transition hover:bg-gray-200">
    <nav class="flex space-x-2">
      {#each resolvedNavigationObjects as { name, resolvedPathname, isActive }}
        <a
          class={[
            [
              "inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-sm",
            ],
            isActive
              ? ["bg-white text-gray-700"]
              : [
                  "bg-transparent text-gray-500 hover:hover:text-blue-600 hover:text-gray-700",
                ],
          ]}
          href={resolvedPathname}
          onclick={() => setLastVisitedOaiPmhAction(resolvedPathname)}
        >
          {name}
        </a>
      {/each}
    </nav>
  </div>
</div>
