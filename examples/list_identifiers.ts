import { oaiPmh } from "./shared.ts";

try {
  for await (
    const arr of oaiPmh.listIdentifiers(
      { metadataPrefix: "marc21" },
      { signal: AbortSignal.timeout(17000) },
    )
  ) {
    console.log(arr);
  }
} catch (e: unknown) {
  if (!(e instanceof DOMException)) throw e;
  console.warn("Aborted");
}
