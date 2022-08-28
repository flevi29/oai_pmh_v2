import { OaiPmh } from "../src/mod.ts";

const oaiPmh = OaiPmh.getNewWithDefaultParser({
  baseUrl: "https://www.hindawi.com/oai-pmh/oai.aspx",
});

console.log(await oaiPmh.identify());
