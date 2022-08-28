type TokenAndRecords<T> = {
  resumptionToken: string | null;
  records: T;
};

interface OaiPmhParserInterface<
  ParsedIdentify = unknown,
  ParsedGetRecord = unknown,
  ParsedListIdentifiers extends TokenAndRecords<unknown> = TokenAndRecords<
    unknown
  >,
  ParsedListMetadataFormats = unknown,
  ParsedListRecords extends TokenAndRecords<unknown> = TokenAndRecords<unknown>,
  ParsedListSets = unknown,
> {
  parseIdentify(xml: string): ParsedIdentify;

  parseGetRecord(xml: string): ParsedGetRecord;

  parseListIdentifiers(xml: string): ParsedListIdentifiers;

  parseListMetadataFormats(xml: string): ParsedListMetadataFormats;

  parseListRecords(xml: string): ParsedListRecords;

  parseListSets(xml: string): ParsedListSets;
}

export type { OaiPmhParserInterface, TokenAndRecords };
