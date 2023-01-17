import { OAIPMH, OAIPMHParser } from "../src/mod.ts";

export const oaiPmh = new OAIPMH(new OAIPMHParser(), {
  baseUrl:
    "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
});
