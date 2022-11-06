// deno-lint-ignore-file no-explicit-any
type ResumptionTokenObj = {
  resumptionToken?: string | {
    "#text": string;
  };
};

type OaiObj = {
  Identify?: Record<string, any>;
  GetRecord?: Record<string, any>;
  ListIdentifiers?: ResumptionTokenObj & { header: any[] };
  ListMetadataFormats?: { metadataFormat: any[] };
  ListRecords?: ResumptionTokenObj & { record: any[] };
  ListSets?: { set: any[] };
};

type RequiredOaiObj = {
  [k in keyof OaiObj]-?: Exclude<OaiObj[k], undefined>;
};

type OaiErrorObj = {
  error: {
    "#text"?: string;
    "@_code": string;
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

export type { DefaultOAIReturnTypes, OaiObj, OaiResponse, RequiredOaiObj };
