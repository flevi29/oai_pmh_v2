import { oaiPmh } from "./shared.ts";

const result = await oaiPmh.getRecord(
  "oai:commons.library.stonybrook.edu:differentia-1007",
  "simple-dublin-core",
);

if (result.metadata !== undefined) {
  for (
    const asd of Array.from(result.metadata, (v) =>
      (<Element> v).outerHTML)
  ) {
    console.log(asd);
  }
} else {
  console.log(result);
}
