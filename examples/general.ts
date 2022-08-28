import { OaiPmh } from "../src/mod.ts";

function handleAbort(error: unknown) {
  if (!(error instanceof DOMException)) throw error;
  console.warn("Aborted");
}

(async () => {
  const oaiPmh = OaiPmh.getNewWithDefaultParser({
    baseUrl: "https://www.hindawi.com/oai-pmh/oai.aspx",
  });

  console.log("List Records:");
  try {
    for await (
      const arr of oaiPmh.listRecords({
        listOptions: { metadataPrefix: "marc21" },
        requestOptions: { signal: AbortSignal.timeout(60000) },
      })
    ) {
      console.log(arr);
      break;
    }
  } catch (e: unknown) {
    handleAbort(e);
  }

  console.log("\nList Sets:");
  try {
    for await (
      const arr of oaiPmh.listSets({
        requestOptions: { signal: AbortSignal.timeout(60000) },
      })
    ) {
      console.log(arr);
      break;
    }
  } catch (e: unknown) {
    handleAbort(e);
  }

  console.log("\nList Identifiers:");
  try {
    for await (
      const arr of oaiPmh.listIdentifiers({
        listOptions: { metadataPrefix: "marc21" },
        requestOptions: { signal: AbortSignal.timeout(60000) },
      })
    ) {
      console.log(arr);
      break;
    }
  } catch (e: unknown) {
    handleAbort(e);
  }

  console.log("\nList Metadata Formats:");
  try {
    for await (
      const arr of oaiPmh.listMetadataFormats({
        requestOptions: { signal: AbortSignal.timeout(60000) },
      })
    ) {
      console.log(arr);
      break;
    }
  } catch (e: unknown) {
    handleAbort(e);
  }

  console.log("\nIdentify:");
  console.log(await oaiPmh.identify());

  console.log("\nGet a single record:");
  console.log(
    await oaiPmh.getRecord("oai:hindawi.com:10.1155/2007/83016", "marc21"),
  );
})().catch(console.error);
