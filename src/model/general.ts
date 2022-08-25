import type { OaiPmhParserInterface } from "./oai_pmh_parser.interface.ts";

export type VerbsAndFieldsForList = {
  ListIdentifiers: "header";
  ListRecords: "record";
  ListSets: "set";
};

export type ListOptions = {
  from?: string;
  until?: string;
  set?: string;
  metadataPrefix: string;
};

export type RequestOptions = {
  abortSignal?: AbortSignal;
  retry?: number;
};

export type BaseOptions = {
  baseUrl: string;
  userAgent: { "User-Agent": string };
};
export type OaiPmhOptionsConstructor = {
  baseUrl: string;
  userAgent: string;
  xmlParser: OaiPmhParserInterface;
};
