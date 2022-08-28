type NonUndefined<T> = T extends undefined ? never : T;

type ResumptionTokenObj = {
  resumptionToken?: string | {
    "#text": string;
  };
};

type OaiObjWithToken = {
  ListIdentifiers?: ResumptionTokenObj & { header: unknown[] };
  ListMetadataFormats?: ResumptionTokenObj & { metadataFormat: unknown[] };
  ListRecords?: ResumptionTokenObj & { record: unknown[] };
  ListSets?: ResumptionTokenObj & { set: unknown[] };
};

type RequiredOaiObjWithToken = {
  [k in keyof OaiObjWithToken]-?: NonUndefined<OaiObjWithToken[k]>;
};

type OaiObj = {
  Identify?: Record<string, unknown>;
  GetRecord?: Record<string, unknown>;
} & OaiObjWithToken;

type RequiredOaiObj = {
  [k in keyof OaiObj]-?: NonUndefined<OaiObj[k]>;
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

export type { NonUndefined, OaiObj, OaiResponse, RequiredOaiObj };
