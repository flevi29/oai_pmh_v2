import { OaiPmh } from "../src/mod.ts";

function handleAbort(error: unknown) {
  if (!(error instanceof DOMException)) throw error;
  console.warn("Aborted");
}

(async () => {
  const oaiPmh = new OaiPmh({
    baseUrl: "https://www.hindawi.com/oai-pmh/oai.aspx",
  });

  console.log("List Records:");
  try {
    for await (
      const gen of oaiPmh.listRecords(
        { metadataPrefix: "marc21" },
        { signal: AbortSignal.timeout(60000) },
      )
    ) {
      const { value, done } = gen.next();
      if (!done) console.log(value);
      break;
    }
  } catch (e: unknown) {
    handleAbort(e);
  }

  console.log("\nList Sets:");
  try {
    for await (
      const gen of oaiPmh.listSets({ signal: AbortSignal.timeout(60000) })
    ) {
      const { value, done } = gen.next();
      if (!done) console.log(value);
      break;
    }
  } catch (e: unknown) {
    handleAbort(e);
  }

  console.log("\nList Identifiers:");
  try {
    for await (
      const gen of oaiPmh.listIdentifiers(
        { metadataPrefix: "marc21" },
        { signal: AbortSignal.timeout(60000) },
      )
    ) {
      const { value, done } = gen.next();
      if (!done) console.log(value);
      break;
    }
  } catch (e: unknown) {
    handleAbort(e);
  }

  console.log("\nList Metadata Formats:");
  console.log(await oaiPmh.listMetadataFormats());

  console.log("\nIdentify:");
  console.log(await oaiPmh.identify());

  console.log("\nGet a single record:");
  console.log(
    await oaiPmh.getRecord("oai:hindawi.com:10.1155/2007/83016", "marc21"),
  );
})().catch(console.error);
