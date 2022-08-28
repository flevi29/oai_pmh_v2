type NonUndefined<T> = T extends undefined ? never : T;

type ResumptionTokenObj = {
  resumptionToken?: string | {
    "#text": string;
  };
};

type OaiObj = {
  Identify?: Record<string, unknown>;
  GetRecord?: Record<string, unknown>;
  ListIdentifiers?: ResumptionTokenObj & { header: unknown[] };
  ListMetadataFormats?: { metadataFormat: unknown[] };
  ListRecords?: ResumptionTokenObj & { record: unknown[] };
  ListSets?: { set: unknown[] };
};

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
