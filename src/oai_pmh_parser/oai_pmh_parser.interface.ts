// deno-lint-ignore-file no-explicit-any
type TokenAndRecords<T> = {
  resumptionToken: string | null;
  records: T;
};

type DefaultOAIReturnTypes = {
  Identify: any;
  GetRecord: any;
  ListIdentifiers: any;
  ListMetadataFormats: any;
  ListRecords: any;
  ListSets: any;
};

interface IOaiPmhParser<
  TOAIReturnTypes extends DefaultOAIReturnTypes = DefaultOAIReturnTypes,
> {
  parseIdentify(xml: string): TOAIReturnTypes["Identify"];

  parseGetRecord(xml: string): TOAIReturnTypes["GetRecord"];

  parseListIdentifiers(
    xml: string,
  ): TokenAndRecords<TOAIReturnTypes["ListIdentifiers"]>;

  parseListMetadataFormats(xml: string): TOAIReturnTypes["ListMetadataFormats"];

  parseListRecords(
    xml: string,
  ): TokenAndRecords<TOAIReturnTypes["ListRecords"]>;

  parseListSets(xml: string): TOAIReturnTypes["ListSets"];
}

export type { IOaiPmhParser, TokenAndRecords };
