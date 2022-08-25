# What is this?

It's a library for Node.js and Deno to easily communicate through "The Open Archives Initiative Protocol for Metadata Harvesting" with certain OAI-PMH hosts.
It is targeting [version 2 of OAI-PMH](https://www.openarchives.org/OAI/openarchivesprotocol.html).

Example:

```typescript
// Node.js
import { OaiPmh, OaiPmhParser } from "oai_pmh_v2";
// Deno
import { OaiPmh, OaiPmhParser } from "https://deno.land/x/oai_pmh_v2/src/mod.ts";

(async () => {
  const oaiPmh = new OaiPmh({
    baseUrl: "https://www.hindawi.com/oai-pmh/oai.aspx",
    xmlParser: new OaiPmhParser(),
  });
  for await (
    const gen of oaiPmh.listSets({ signal: AbortSignal.timeout(60000) })
  ) {
    for (const value of gen) {
      console.log(value);
    }
  }
})().catch(console.error);
```

Find examples for all methods in examples directory. Some things are only documented via types for.
