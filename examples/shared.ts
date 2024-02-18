import { OAIPMH, STATUS } from "../src/mod.ts";

const oaiPmh = new OAIPMH({
  baseURL:
    "http://bibliotecavirtual.asturias.es/i18n/oai/oai_bibliotecavirtual.asturias.es.cmd",
});

export { oaiPmh, STATUS };
