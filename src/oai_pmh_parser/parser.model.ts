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
  status?: "deleted";
};

type OAIRecord<TMetadata = unknown> = {
  header: OAIRecordHeader;
  metadata: TMetadata;
  about?: MaybeArr<unknown>;
};

type OAIMetadataFormat = {
  metadataPrefix: string;
  schema: string;
  metadataNamespace: string;
};

type OAISet = { setSpec: string; setName: string };

type OAIBaseObj = Partial<{
  Identify: OAIRepositoryDescription;
  GetRecord: OAIRecord;
  ListIdentifiers: OAIResumptionTokenResponse & {
    header: MaybeArr<OAIRecordHeader>;
  };
  ListMetadataFormats: { metadataFormat: MaybeArr<OAIMetadataFormat> };
  ListRecords: OAIResumptionTokenResponse & { record: MaybeArr<OAIRecord> };
  ListSets: { set: MaybeArr<OAISet> };
}>;

type Code =
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
    "@_code": Code;
  };
};

type OAIResponse = {
  "OAI-PMH": OAIErrorObj | OAIBaseObj;
};

export type {
  Code,
  MaybeArr,
  OAIBaseObj,
  OAIErrorObj,
  OAIMetadataFormat,
  OAIRecord,
  OAIRecordHeader,
  OAIRepositoryDescription,
  OAIResponse,
  OAIResumptionTokenResponse,
  OAISet,
};
