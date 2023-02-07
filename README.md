[![Version][npm-svg]][npm-url] [![Deno][deno-svg]][deno-url]

## What is this?

It's a "*blazingly fast*"
[OAI-PMH Version 2.0](https://www.openarchives.org/OAI/openarchivesprotocol.html)
API client module for Node.js and Deno.

### Install for Node.js

```sh
npm i oai_pmh_v2
```

> **Warning** In case you are using this with Node.js, this is an ESM only
> module. Read more
> [here](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

### Example

```typescript
// module Node.js
import { OAIPMH, OAIPMHParser } from "oai_pmh_v2";
// Deno
import {
  OAIPMH,
  OAIPMHParser,
} from "https://deno.land/x/oai_pmh_v2/src/mod.ts";

// You can find a bunch of OAI-PMH providers here (although a lot of them might be non functional):
// https://www.openarchives.org/Register/BrowseSites
const oaiPmh = new OAIPMH(new OAIPMHParser(), {
  baseUrl:
    "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
});

const info = await oaiPmh.identify({ signal: AbortSignal.timeout(20000) });

console.log(info);
```

[//]: # (@TODO Add parser options and types)

Find examples for all methods in
[examples directory](https://github.com/flevi29/oai_pmh_v2/tree/main/examples).
Some things are only documented via types for now.

[npm-svg]: https://img.shields.io/npm/v/oai_pmh_v2.svg?style=flat-square
[npm-url]: https://npmjs.org/package/oai_pmh_v2
[deno-svg]: https://img.shields.io/badge/deno-land-blueviolet?style=flat-square
[deno-url]: https://deno.land/x/oai_pmh_v2
