import { oaiPmh } from "./shared.ts";

console.log(
  await oaiPmh.getRecord("oai:bibliotecavirtual.asturias.es:100", "marc21"),
);
