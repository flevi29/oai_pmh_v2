# What is this?

It's a module for Node.js and Deno to easily communicate through "The Open
Archives Initiative Protocol for Metadata Harvesting" with certain OAI-PMH
hosts. It is targeting
[version 2 of OAI-PMH](https://www.openarchives.org/OAI/openarchivesprotocol.html).

Example:

```typescript
// Node.js
import { OaiPmh } from "oai_pmh_v2";
// Deno
import { OaiPmh } from "https://deno.land/x/oai_pmh_v2/src/mod.ts";

(async () => {
  const oaiPmh = OaiPmh.getNewWithDefaultParser({
    baseUrl:
      "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
  });

  const info = await oaiPmh.identify({ signal: AbortSignal.timeout(60000) });

  console.log(info);
})().catch(console.error);
```

Find examples for all methods in examples directory. Some things are only
documented via types.
