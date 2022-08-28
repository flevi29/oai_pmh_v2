import { OaiPmh } from "../src/mod.ts";

export const oaiPmh = OaiPmh.getNewWithDefaultParser({
  baseUrl:
    "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
});
