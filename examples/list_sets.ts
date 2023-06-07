import { oaiPmh } from "./shared.ts";

try {
  for await (
    const arr of oaiPmh.listSets({ signal: AbortSignal.timeout(17000) })
  ) {
    console.log(arr);
  }
} catch (error: unknown) {
  if (!(error instanceof DOMException)) {
    throw error;
  }
  console.warn("Aborted");
}
