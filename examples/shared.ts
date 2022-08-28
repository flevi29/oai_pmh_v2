import { OaiPmh } from "../src/mod.ts";

// you can find a bunch of OAI-PMH providers here:
// https://www.openarchives.org/Register/BrowseSites

export const oaiPmh = OaiPmh.getNewWithDefaultParser({
  baseUrl:
    "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
});
