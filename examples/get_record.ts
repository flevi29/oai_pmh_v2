import { oaiPmh } from "./shared.ts";

console.log(
  await oaiPmh.getRecord("oai:hindawi.com:10.1155/2007/83016", "marc21"),
);
