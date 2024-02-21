# OAI-PMH TypeScript client

[![Version][npm-svg]][npm-url]

It's an
[OAI-PMH Version 2.0](https://www.openarchives.org/OAI/openarchivesprotocol.html)
API client package/module for Node.js and Deno.

## Installing (Node.js)

```sh
npm i oai_pmh_v2
```

> [!IMPORTANT]
> For Node.js users a
> [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch#browser_compatibility)
> compatible version of the runtime is required, or a polyfill otherwise (like
> [`node-fetch`](https://github.com/node-fetch/node-fetch?tab=readme-ov-file#providing-global-access)).

## Example

> [!NOTE]
> It is possible to iterate through the generator with a `for...of`
> loop, but this way we can only acquire the
> [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield)
> -ed values of the generator, the `return` -ed value would be lost, and the
> `return` -ed value contains the potential error.

```typescript
// `... from "npm:oai_pmh_v2"` for Deno
import { OAIPMH, STATUS } from "oai_pmh_v2";

// you can find OAI-PMH providers here (although a lot of them might not work):
// https://www.openarchives.org/Register/BrowseSites
const oaiPMH = new OAIPMH({
  baseURL:
    "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
});

const g = oaiPMH.listIdentifiers(
  { metadataPrefix: "marc21", from: "2015-04-10", until: "2015-10-28" },
  { signal: AbortSignal.timeout(30_000) },
);

for (;;) {
  const { done, value: gVal } = await g.next();

  if (done) {
    // there are no more values yielded by the generator
    const { status, value } = gVal;

    if (status !== STATUS.OK) {
      // handle error, we can narrow error type by checking
      // against specific values of `STATUS` enum
      console.error(value);
    }

    // break out of loop as there are no more yielded values
    break;
  }

  console.log(JSON.stringify(gVal));
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
