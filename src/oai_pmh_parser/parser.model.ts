// deno-lint-ignore-file no-explicit-any
type ResumptionTokenObj = {
  resumptionToken?: string | {
    "#text": string;
  };
};

type OAIMethodTypes = {
  Identify: {
    repositoryName: string;
    baseURL: string;
    protocolVersion: string;
    earliestDatestamp: string;
    deletedRecord: "no" | "transient" | "persistent";
    granularity: `YYYY-MM-DD${"Thh:mm:ssZ" | ""}`;
    // @TODO This might not be true
    adminEmail: string[] | string;
    compression?: string;
    description?: string;
  };
  GetRecord: Record<string, any>;
  ListIdentifiers: ResumptionTokenObj & { header: any[] };
  ListMetadataFormats: { metadataFormat: any[] };
  ListRecords: ResumptionTokenObj & { record: any[] };
  ListSets: { set: any[] };
};
type OAIMethodTypesToExtend = { [k in keyof OAIMethodTypes]?: any };
type OAIMethodTypesDefault = { [k in keyof OAIMethodTypes]?: undefined };
type OAIMethodTypesFinalType = {
  [k in keyof OAIMethodTypes]: k extends "ListIdentifiers"
    ? OAIMethodTypes[k]["header"]
    : k extends "ListMetadataFormats" ? OAIMethodTypes[k]["metadataFormat"]
    : k extends "ListRecords" ? OAIMethodTypes[k]["record"]
    : k extends "ListSets" ? OAIMethodTypes[k]["set"]
    : OAIMethodTypes[k];
};

type OAIBaseObj = Partial<OAIMethodTypes>;

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
  OAIBaseObj,
  OAIMethodTypesDefault,
  OAIMethodTypesFinalType,
  OAIMethodTypesToExtend,
  OAIResponse,
  ResumptionTokenObj,
};
