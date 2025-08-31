<script lang="ts">
  import type { ParsedXMLAttributes } from "oai_pmh_v2/mod";

  const { attr }: { attr: ParsedXMLAttributes } = $props();
</script>

<span class="text-sm"
  >{#each Object.entries(attr) as [key, { prefix, value }]}
    <span class="ml-1">
      {#if prefix !== undefined}<span class="text-rose-700">{prefix}</span
        >:{/if}<span class="text-fuchsia-700">{key}</span><span class="ml-1"
        >=</span
      ><span class="ml-1 text-indigo-700">{value}</span></span
    >{/each}</span
>
