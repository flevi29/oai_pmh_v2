import { OaiPmh, OaiPmhParser } from "../src/mod.ts";

export const oaiPmh = new OaiPmh(new OaiPmhParser(), {
  baseUrl:
    "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
});
