[![Version](https://badgen.net/npm/v/oai_pmh_v2)](https://www.npmjs.com/package/oai_pmh_v2)

# What is this?

A blazingly fast module for Node.js and Deno to communicate through "The Open
Archives Initiative Protocol for Metadata Harvesting" with OAI-PMH providers. It
is targeting
[version 2 of OAI-PMH](https://www.openarchives.org/OAI/openarchivesprotocol.html).

Example:

```typescript
// Node.js
import { OaiPmh } from "oai_pmh_v2";
// Deno
import { OaiPmh } from "https://deno.land/x/oai_pmh_v2/src/mod.ts";

(async () => {
  // you can find a bunch of OAI-PMH providers here (although a lot of them might be non functional):
  // https://www.openarchives.org/Register/BrowseSites
  const oaiPmh = OaiPmh.getNewWithDefaultParser({
    baseUrl:
      "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
  });

  const info = await oaiPmh.identify({ signal: AbortSignal.timeout(20000) });

  console.log(info);
})().catch(console.error);
```

Find examples for all methods in
[examples directory](https://github.com/flevi29/oai_pmh_v2/tree/main/examples).
Some things are only documented via types for now.
