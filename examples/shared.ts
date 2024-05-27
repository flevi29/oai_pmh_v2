import { DOMParser as importedDOMParser } from "npm:linkedom@0.18.0/worker";
import { OAIPMH } from "../src/mod.ts";

const oaiPmh = new OAIPMH({
  baseURL: "https://commons.library.stonybrook.edu/do/oai/",
  domParser: importedDOMParser,
});

export { oaiPmh };
