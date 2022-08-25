import type { OaiPmhParserInterface } from "./oai_pmh_parser.interface.ts";

type VerbsAndFieldsForList = {
  ListIdentifiers: "header";
  ListRecords: "record";
  ListSets: "set";
};

type ListOptions = {
  from?: string;
  until?: string;
  set?: string;
  metadataPrefix: string;
};

type RequestOptions = {
  signal?: AbortSignal;
};

type BaseOptions = {
  baseUrl: string;
  userAgent: { "User-Agent": string };
};
type OaiPmhOptionsConstructor = {
  baseUrl: string;
  userAgent?: string;
  xmlParser: OaiPmhParserInterface;
};

export type {
  BaseOptions,
  ListOptions,
  OaiPmhOptionsConstructor,
  RequestOptions,
  VerbsAndFieldsForList,
};
