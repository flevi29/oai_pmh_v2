import { oaiPmh } from "./shared.ts";

try {
  for await (
    const result of oaiPmh.listSets({
      signal: AbortSignal.timeout(30_000),
    })
  ) {
    console.log(result);
  }
} catch (error: unknown) {
  if (typeof error === "object" && error !== null && "xml" in error) {
    console.log(error.xml);
  }

  throw error;
}
