[![Version][npm-svg]][npm-url] [![Deno][deno-svg]][deno-url]

## What is this?

It's a "_blazingly fast_"
[OAI-PMH Version 2.0](https://www.openarchives.org/OAI/openarchivesprotocol.html)
API client module for Node.js and Deno.

### Install for Node.js

```sh
npm i oai_pmh_v2
```

> **Note** For Node.js users this is an ESM only module. Read more
> [here](https://www.typescriptlang.org/docs/handbook/esm-node.html) and maybe
> [here](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

### Example

```typescript
// Node.js
import { OAIPMH, OAIPMHParser } from "oai_pmh_v2";
// Deno
import {
  OAIPMH,
  OAIPMHParser,
} from "https://deno.land/x/oai_pmh_v2/src/mod.ts";

// You can find OAI-PMH providers here (although a lot of them might be non functional):
// https://www.openarchives.org/Register/BrowseSites
const oaiPmh = new OAIPMH({
  baseUrl:
    "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
});

const info = await oaiPmh.identify({ signal: AbortSignal.timeout(17000) });

console.log(info);

for await (
  const records of oaiPmh.listRecords(
    { metadataPrefix: "marc21" },
    { signal: AbortSignal.timeout(17000) },
  )
) {
  // if records.metadata is not undefined, then it should be cast
  // as expected type or better yet validated via for example a zod schema
  console.log(records);
}
```

[//]: # (@TODO Talk about issue with abort controller)

> **Warning** Arrays require special attention because in XML there's no
> distinction between single element array property or just a property with that
> element. Properties of type `T[]` should be defined as `T | T[]`, and always checked with
> [`Array.isArray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray),
> unless absolutely sure the array is always of length 2 or greater.

> **Note** Parsed
> [XML attributes](https://www.w3schools.com/xml/xml_attributes.asp) are
> prefixed with `@_`, while XML text is parsed into `#text` property.

Find examples for all methods in
[examples directory](https://github.com/flevi29/oai_pmh_v2/tree/main/examples).
Some things are only documented via types for now.

[npm-svg]: https://img.shields.io/npm/v/oai_pmh_v2.svg?style=flat-square
[npm-url]: https://npmjs.org/package/oai_pmh_v2
[deno-svg]: https://img.shields.io/badge/deno-land-blueviolet?style=flat-square
[deno-url]: https://deno.land/x/oai_pmh_v2
