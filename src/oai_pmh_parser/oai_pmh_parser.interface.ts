// deno-lint-ignore-file no-explicit-any
import {
  OAIMethodTypesDefault,
  OAIMethodTypesToExtend,
} from "./parser.model.ts";

type TokenAndRecords<T> = {
  resumptionToken: string | null;
  records: T;
};

interface IOAIPMHParser<
  TOAIReturnTypes extends OAIMethodTypesToExtend = OAIMethodTypesDefault,
> {
  parseIdentify<
    TIdentify extends (undefined extends TOAIReturnTypes["Identify"] ? any
      : TOAIReturnTypes["Identify"]),
  >(xml: string): TIdentify;

  parseGetRecord<
    TGetRecord extends (undefined extends TOAIReturnTypes["GetRecord"] ? any
      : TOAIReturnTypes["GetRecord"]),
  >(xml: string): TGetRecord;

  parseListIdentifiers<
    TListIdentifiers
      extends (undefined extends TOAIReturnTypes["ListIdentifiers"] ? any
        : TOAIReturnTypes["ListIdentifiers"]),
  >(xml: string): TokenAndRecords<TListIdentifiers>;

  parseListMetadataFormats<
    TListMetadataFormats
      extends (undefined extends TOAIReturnTypes["ListMetadataFormats"] ? any
        : TOAIReturnTypes["ListMetadataFormats"]),
  >(xml: string): TListMetadataFormats;

  parseListRecords<
    TListRecords extends (undefined extends TOAIReturnTypes["ListRecords"] ? any
      : TOAIReturnTypes["ListRecords"]),
  >(xml: string): TokenAndRecords<TListRecords>;

  parseListSets<
    TListSets extends (undefined extends TOAIReturnTypes["ListSets"] ? any
      : TOAIReturnTypes["ListSets"]),
  >(xml: string): TListSets;
}

export type { IOAIPMHParser, TokenAndRecords };
