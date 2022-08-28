import { oaiPmh } from "./shared.ts";

try {
  console.log(await oaiPmh.listMetadataFormats());
} catch (e: unknown) {
  if (!(e instanceof DOMException)) throw e;
  console.warn("Aborted");
}
