import { oaiPmh } from "./shared.ts";

try {
  console.log(await oaiPmh.listSets());
} catch (error: unknown) {
  if (!(error instanceof DOMException)) {
    throw error;
  }
  console.warn("Aborted");
}
