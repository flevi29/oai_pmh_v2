import { OaiPmh } from "../src/mod.ts";

const oaiPmh = OaiPmh.getNewWithDefaultParser({
  baseUrl: "https://www.hindawi.com/oai-pmh/oai.aspx",
});

console.log(
  await oaiPmh.getRecord("oai:hindawi.com:10.1155/2007/83016", "marc21"),
);
