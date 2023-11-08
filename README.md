# OAI-PMH TypeScript client

[![Version][npm-svg]][npm-url] [![Deno][deno-svg]][deno-url]

It's an
[OAI-PMH Version 2.0](https://www.openarchives.org/OAI/openarchivesprotocol.html)
API client package/module for Node.js and Deno.

## Installing (Node.js)

```sh
npm i oai_pmh_v2
```

> [!IMPORTANT]
> For Node.js users, minimum 18.0.0 is required, and this is an ESM
> only package, read more
> [here](https://www.typescriptlang.org/docs/handbook/esm-node.html) and maybe
> [here](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

## Example

```typescript
// Node.js
import { OAIPMH, OAIPMHError, ParsedOAIPMHError } from "oai_pmh_v2";
// Deno
import {
  OAIPMH,
  OAIPMHError,
  ParsedOAIPMHError,
} from "https://deno.land/x/oai_pmh_v2/src/mod.ts";

// you can find OAI-PMH providers here (although a lot of them might not work):
// https://www.openarchives.org/Register/BrowseSites
const oaiPMH = new OAIPMH({
  baseUrl:
    "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
});

try {
  for await (
    const values of oaiPMH.listIdentifiers(
      { metadataPrefix: "marc21", from: "2015-08-03", until: "2016-05-30" },
      { signal: AbortSignal.timeout(20_000) },
    )
  ) {
    console.log(JSON.stringify(values));
  }

  const info = await oaiPMH.identify();

  console.log(info);
} catch (error: unknown) {
  console.error(error);

  if (
    error instanceof OAIPMHError && error.cause instanceof ParsedOAIPMHError
  ) {
    // this means there are specific errors returned by the OAI-PMH provider
    for (const returnedError of error.cause.cause) {
      console.error(returnedError);
    }
  }
}
```

> [!WARNING]
> When using an `AbortSignal` with any list method
> (`listIdentifiers`, `listRecords`, `listSets`), there will be some minuscule
> memory leak until the loop exits. This is because for each request there is an
> additional listener registered for the signal. Specifically in Node.js this
> will cause a lot of warnings (after 100 or so loops). This is a fetch API spec
> limitation, see [issue](https://github.com/nodejs/undici/issues/939).

## General shape of parsed data

```typescript
type ParsedXMLRecordValue = {
  // index in XML tree branch, for preserving order of elements
  i: number;
  // XML attributes
  attr?: Record<string, string>;
  // either a text value, another branch of the XML tree,
  // or undefined in case of an empty XML element
  val?: string | ParsedXML;
};

type ParsedXML = Record<string, ParsedXMLRecordValue[]>;
```

Find examples for all methods in
[examples directory](https://github.com/flevi29/oai_pmh_v2/tree/main/examples).
Documentation via types.

[npm-svg]: https://img.shields.io/npm/v/oai_pmh_v2.svg?style=flat-square
[npm-url]: https://npmjs.org/package/oai_pmh_v2
[deno-svg]: https://img.shields.io/badge/deno-land-blueviolet?style=flat-square
[deno-url]: https://deno.land/x/oai_pmh_v2
