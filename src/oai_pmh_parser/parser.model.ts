type MaybeArr<T> = T | T[];

type OAIResumptionTokenResponse = {
  resumptionToken?: string | {
    "#text": string;
  };
};

type OAIDescriptionContainer = { URL: string; [key: string]: unknown };

type OAIRepositoryDescription = {
  repositoryName: string;
  baseURL: string;
  protocolVersion: string;
  earliestDatestamp: string;
  deletedRecord: "no" | "transient" | "persistent";
  granularity: `YYYY-MM-DD${"Thh:mm:ssZ" | ""}`;
  adminEmail: MaybeArr<string>;
  compression?: MaybeArr<string>;
  description?: MaybeArr<Record<string, OAIDescriptionContainer>>;
  [key: string]: unknown;
};

type OAIRecordHeader = {
  identifier: string;
  datestamp: string;
  setSpec: MaybeArr<string>;
  "@_status"?: "deleted";
};
type OAIMaybeArrRecordHeader = MaybeArr<OAIRecordHeader>;

// Due to XML parsing limitations, an array with a single value will not be an array
type OAIRecordMetadata<T> = T extends (infer U)[] ? MaybeArr<U>
  // deno-lint-ignore no-explicit-any
  : T extends Record<string | number | symbol, any>
    ? { [k in keyof T]: OAIRecordMetadata<T[k]> }
  : T;

// Header "@_status": "deleted" would mean metadata doesn't exist, but
// couldn't make typescript believe this fact
// @TODO Maybe there's a way to accomplish this?
type OAIRecord<TMetadata = unknown> = {
  header: OAIRecordHeader;
  metadata?: OAIRecordMetadata<TMetadata>;
  about?: MaybeArr<unknown>;
};
type OAIMaybeArrRecord<TMetadata = unknown> = MaybeArr<OAIRecord<TMetadata>>;

type OAIMetadataFormat = {
  metadataPrefix: string;
  schema: string;
  metadataNamespace: string;
};
type OAIMaybeArrMetadataFormat = MaybeArr<OAIMetadataFormat>;

type OAISet = { setSpec: string; setName: string };
type OAIMaybeArrSet = MaybeArr<OAISet>;

type OAIBaseObj = Partial<{
  Identify: OAIRepositoryDescription;
  GetRecord: { record: OAIRecord };
  ListIdentifiers: OAIResumptionTokenResponse & {
    header: OAIMaybeArrRecordHeader;
  };
  ListMetadataFormats: { metadataFormat: OAIMaybeArrMetadataFormat };
  ListRecords: OAIResumptionTokenResponse & { record: OAIMaybeArrRecord };
  ListSets: { set: OAIMaybeArrSet };
}>;

type OAIErrorCode =
  | "badArgument"
  | "badResumptionToken"
  | "badVerb"
  | "cannotDisseminateFormat"
  | "idDoesNotExist"
  | "noRecordsMatch"
  | "noMetadataFormats"
  | "noSetHierarchy";

type OAIErrorObj = {
  error: {
    "#text"?: string;
    "@_code": OAIErrorCode;
  };
};

type OAIResponse = {
  "OAI-PMH": OAIErrorObj | OAIBaseObj;
};

export type {
  OAIBaseObj,
  OAIErrorCode,
  OAIErrorObj,
  OAIMaybeArrMetadataFormat,
  OAIMaybeArrRecord,
  OAIMaybeArrRecordHeader,
  OAIMaybeArrSet,
  OAIMetadataFormat,
  OAIRecord,
  OAIRecordHeader,
  OAIRecordMetadata,
  OAIRepositoryDescription,
  OAIResponse,
  OAIResumptionTokenResponse,
  OAISet,
};
