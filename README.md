[![Version][npm-svg]][npm-url] [![Deno][deno-svg]][deno-url]

## What is this?

It's a blazingly fast
[OAI-PMH Version 2.0](https://www.openarchives.org/OAI/openarchivesprotocol.html)
API client module for Node.js and Deno.

### Install for Node.js

```sh
npm i oai_pmh_v2
```

> NOTE: This is an ESM only module, so in the default commonjs Node.js
> environment it needs to be
> [dynamically imported](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
> (see example comment)

### Example

```typescript
// module Node.js
import { OaiPmh, OaiPmhParser } from "oai_pmh_v2";
// Deno
import {
  OaiPmh,
  OaiPmhParser,
} from "https://deno.land/x/oai_pmh_v2/src/mod.ts";

(async () => {
  // For commonjs Node.js use dynamic import:
  // const { OaiPmh, OaiPmhParser } = await import("oai_pmh_v2");
  // You can find a bunch of OAI-PMH providers here (although a lot of them might be non functional):
  // https://www.openarchives.org/Register/BrowseSites
  const oaiPmh = new OaiPmh(new OaiPmhParser(), {
    baseUrl:
      "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
  });

  const info = await oaiPmh.identify({ signal: AbortSignal.timeout(20000) });

  console.log(info);
})().catch(console.error);
```

### Define your own types, customize parser options

```typescript
// Define your types
new OaiPmhParser<{
  GetRecord: MARCRecordUnit;
  ListRecords: MARCRecordUnit[];
}>();

// Custom options
new OaiPmhParser({
  ignoreAttributes: false,
  parseAttributeValue: false,
  parseTagValue: false,
  isArray: (_, jPath) => alwaysArrayPaths.indexOf(jPath) !== -1,
});
```

Find examples for all methods in
[examples directory](https://github.com/flevi29/oai_pmh_v2/tree/main/examples).
Some things are only documented via types for now.

[npm-svg]: https://img.shields.io/npm/v/oai_pmh_v2.svg?style=flat-square
[npm-url]: https://npmjs.org/package/oai_pmh_v2
[deno-svg]: https://img.shields.io/badge/deno-land-blueviolet?style=flat-square
[deno-url]: https://deno.land/x/oai_pmh_v2
