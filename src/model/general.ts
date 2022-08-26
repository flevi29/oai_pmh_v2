import { X2jOptionsOptional } from "../../deps.ts";
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
  retry?: number;
};

type BaseOptions = {
  baseUrl: URL;
  userAgent: { "User-Agent": string };
};
type OaiPmhOptionsConstructor =
  & {
    baseUrl: string;
    userAgent?: string;
  }
  & ({ xmlParser: OaiPmhParserInterface } | {
    defaultParserConfig?: X2jOptionsOptional;
  });

export type {
  BaseOptions,
  ListOptions,
  OaiPmhOptionsConstructor,
  RequestOptions,
  VerbsAndFieldsForList,
};
