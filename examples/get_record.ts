import { oaiPmh } from "./shared.ts";

const result = await oaiPmh.getRecord(
  "oai:bibliotecavirtual.asturias.es:100",
  "marc21",
);
console.log(result);
