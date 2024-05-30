import { oaiPmh } from "./shared.ts";

const result = await oaiPmh.identify().catch((error: unknown) => {
  if (typeof error === "object" && error !== null && "xml" in error) {
    console.log(error.xml);
  }

  throw error;
});
console.log(result);
