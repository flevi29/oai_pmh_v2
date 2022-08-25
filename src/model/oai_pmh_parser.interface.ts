import type { VerbsAndFieldsForList } from "./general.ts";

export interface OaiPmhParserInterface {
  parseResumptionToken(
    value: any,
    verb: keyof VerbsAndFieldsForList,
  ): string | null;

  parseOaiPmhXml(xml: string): any;

  parseIdentify(value: any): any;

  parseMetadataFormats(value: any): any;

  parseRecord(value: any): any;

  parseList<
    T extends keyof VerbsAndFieldsForList = keyof VerbsAndFieldsForList,
  >(
    value: any,
    verb: T,
    field: VerbsAndFieldsForList[T],
  ): any;
}
