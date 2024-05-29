import { oaiPmh } from "./shared.ts";

try {
  for await (
    const asd of oaiPmh.listIdentifiers(
      { metadataPrefix: "simple-dublin-core" },
      { signal: AbortSignal.timeout(30_000) },
    )
  ) {
    console.log(asd);
  }
} catch (error: unknown) {
  if (typeof error === "object" && error !== null && "xml" in error) {
    console.log(error.xml);
  }

  throw error;
}
