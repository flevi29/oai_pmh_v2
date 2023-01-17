// deno-lint-ignore-file no-explicit-any
type ResumptionTokenObj = {
  resumptionToken?: string | {
    "#text": string;
  };
};

type OaiObj = {
  Identify?: {
    repositoryName: string;
    baseURL: string;
    protocolVersion: string;
    earliestDatestamp: string;
    deletedRecord: "no" | "transient" | "persistent";
    granularity: `YYYY-MM-DD${"Thh:mm:ssZ" | ""}`;
    adminEmail: string[] | string;
    compression?: string;
    description?: string;
  };
  GetRecord?: Record<string, any>;
  ListIdentifiers?: ResumptionTokenObj & { header: any[] };
  ListMetadataFormats?: { metadataFormat: any[] };
  ListRecords?: ResumptionTokenObj & { record: any[] };
  ListSets?: { set: any[] };
};

type RequiredOaiObj = {
  [k in keyof OaiObj]-?: Exclude<OaiObj[k], undefined>;
};

type Code =
  | "badArgument"
  | "badResumptionToken"
  | "badVerb"
  | "cannotDisseminateFormat"
  | "idDoesNotExist"
  | "noRecordsMatch"
  | "noMetadataFormats"
  | "noSetHierarchy";

type OaiErrorObj = {
  error: {
    "#text"?: string;
    "@_code": Code;
  };
};

type OaiResponse = {
  "OAI-PMH": OaiErrorObj | OaiObj;
};

type DefaultOAIReturnTypes = {
  Identify: RequiredOaiObj["Identify"];
  GetRecord: RequiredOaiObj["GetRecord"];
  ListIdentifiers: RequiredOaiObj["ListIdentifiers"]["header"];
  ListMetadataFormats: RequiredOaiObj["ListMetadataFormats"]["metadataFormat"];
  ListRecords: RequiredOaiObj["ListRecords"]["record"];
  ListSets: RequiredOaiObj["ListSets"]["set"];
};

export type {
  Code,
  DefaultOAIReturnTypes,
  OaiObj,
  OaiResponse,
  RequiredOaiObj,
};
