import { oaiPmh } from "./shared.ts";

try {
  for await (
    const arr of oaiPmh.listIdentifiers({
      listOptions: { metadataPrefix: "marc21" },
      requestOptions: { signal: AbortSignal.timeout(170000) },
    })
  ) {
    console.log(arr);
  }
} catch (e: unknown) {
  if (!(e instanceof DOMException)) throw e;
  console.warn("Aborted");
}
