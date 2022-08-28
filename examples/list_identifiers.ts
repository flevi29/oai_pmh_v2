import { OaiPmh } from "../src/mod.ts";

const oaiPmh = OaiPmh.getNewWithDefaultParser({
  baseUrl: "https://www.hindawi.com/oai-pmh/oai.aspx",
});

try {
  for await (
    const arr of oaiPmh.listIdentifiers({
      listOptions: { metadataPrefix: "marc21" },
      requestOptions: { signal: AbortSignal.timeout(17000) },
    })
  ) {
    console.log(arr);
  }
} catch (e: unknown) {
  if (!(e instanceof DOMException)) throw e;
  console.warn("Aborted");
}
