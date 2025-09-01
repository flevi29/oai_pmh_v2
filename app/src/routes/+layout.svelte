<script lang="ts">
  import "../app.css";
  import URLInputComponent from "./url-input.svelte";
  import NavsComponent from "$lib/components/navs.svelte";

  const { children } = $props();
</script>

<div>
  <div class="mx-auto max-w-5xl py-5">
    <div class="w-full py-4">
      <URLInputComponent />
    </div>

    <NavsComponent
      navigationObjects={[
        ["Identify", "/identify"],
        ["ListMetadataFormats", "/list-metadata-formats"],
        ["ListIdentifiers", "/list-identifiers"],
        ["ListRecords", "/list-records"],
        ["ListSets", "/list-sets"],
        ["GetRecord", "/get-record"],
      ]}
    />

    <div class="rounded-xl border p-6 shadow-sm">
      {@render children()}
    </div>
  </div>
</div>
