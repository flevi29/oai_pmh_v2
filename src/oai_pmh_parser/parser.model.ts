import { z } from "../../deps.ts";

// Find documentation at:
// http://www.openarchives.org/OAI/openarchivesprotocol.html
// view-source:http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd

const SIMPLE_TEXT_OBJ = z.strictObject({
  "#text": z.string(),
});

const OAI_RESUMPTION_TOKEN = z.object({
  "#text": z.string(),
});

const OAI_REPOSITORY_DESCRIPTION = z.strictObject({
  repositoryName: SIMPLE_TEXT_OBJ,
  baseURL: SIMPLE_TEXT_OBJ,
  protocolVersion: SIMPLE_TEXT_OBJ,
  earliestDatestamp: SIMPLE_TEXT_OBJ,
  deletedRecord: z.strictObject({
    "#text": z.union([
      z.literal("no"),
      z.literal("transient"),
      z.literal("persistent"),
    ]),
  }),
  granularity: z.strictObject({
    "#text": z.literal("YYYY-MM-DD").or(z.literal("YYYY-MM-DDThh:mm:ssZ")),
  }),
  adminEmail: SIMPLE_TEXT_OBJ.array().or(SIMPLE_TEXT_OBJ),
  compression: SIMPLE_TEXT_OBJ.array().or(SIMPLE_TEXT_OBJ).optional(),
  description: z.unknown().optional(),
});
type OAIRepositoryDescription = z.infer<typeof OAI_REPOSITORY_DESCRIPTION>;

const OAI_RECORD_HEADER = z.strictObject({
  identifier: SIMPLE_TEXT_OBJ,
  datestamp: SIMPLE_TEXT_OBJ,
  setSpec: SIMPLE_TEXT_OBJ.array().or(SIMPLE_TEXT_OBJ).optional(),
  "@_status": z.literal("deleted").optional(),
});
type OAIRecordHeader = z.infer<typeof OAI_RECORD_HEADER>;
const OAI_RECORD_HEADER_MAYBE_ARR = OAI_RECORD_HEADER.array().or(
  OAI_RECORD_HEADER,
);
type OAIRecordHeaderMaybeArr = z.infer<typeof OAI_RECORD_HEADER_MAYBE_ARR>;

// Header "@_status": "deleted" would mean metadata doesn't exist, but
// couldn't make typescript believe this fact
// @TODO: Maybe there's a way to accomplish this?
const OAI_RECORD = z.strictObject({
  header: OAI_RECORD_HEADER,
  metadata: z.unknown().optional(),
  about: z.unknown().optional(),
});
type OAIRecord = z.infer<typeof OAI_RECORD>;
const OAI_RECORD_MAYBE_ARR = OAI_RECORD.array().or(OAI_RECORD);
type OAIRecordMaybeArr = z.infer<typeof OAI_RECORD_MAYBE_ARR>;

const OAI_METADATA_FORMAT = z.strictObject({
  metadataPrefix: SIMPLE_TEXT_OBJ,
  schema: SIMPLE_TEXT_OBJ,
  metadataNamespace: SIMPLE_TEXT_OBJ,
});
type OAIMetadataFormat = z.infer<typeof OAI_METADATA_FORMAT>;
const OAI_METADATA_FORMAT_MAYBE_ARR = OAI_METADATA_FORMAT.array().or(
  OAI_METADATA_FORMAT,
);
type OAIMetadataFormatMaybeArr = z.infer<typeof OAI_METADATA_FORMAT_MAYBE_ARR>;

const OAI_SET = z.strictObject({
  setSpec: SIMPLE_TEXT_OBJ,
  setName: SIMPLE_TEXT_OBJ,
});
type OAISet = z.infer<typeof OAI_SET>;
const OAI_SET_MAYBE_ARR = OAI_SET.array().or(OAI_SET);
type OAISetMaybeArr = z.infer<typeof OAI_SET_MAYBE_ARR>;

// @TODO: include schemas?
const IDENTIFY = z.object({ Identify: OAI_REPOSITORY_DESCRIPTION });
const GET_RECORD = z.object({
  GetRecord: z.strictObject({ record: OAI_RECORD }),
});
const LIST_METADATA_FORMATS = z.object({
  ListMetadataFormats: z.strictObject({
    metadataFormat: OAI_METADATA_FORMAT_MAYBE_ARR,
  }),
});
const LIST_SETS = z.object({
  ListSets: z.strictObject({ set: OAI_SET_MAYBE_ARR }),
});
const LIST_IDENTIFIERS = z.object({
  ListIdentifiers: z.strictObject({
    header: OAI_RECORD_HEADER_MAYBE_ARR,
    resumptionToken: OAI_RESUMPTION_TOKEN.optional(),
  }),
});
const LIST_RECORDS = z.object({
  ListRecords: z.strictObject({
    record: OAI_RECORD_MAYBE_ARR,
    resumptionToken: OAI_RESUMPTION_TOKEN.optional(),
  }),
});
type ResumptionTokenResponses =
  | z.infer<typeof LIST_IDENTIFIERS>["ListIdentifiers"]
  | z.infer<typeof LIST_RECORDS>["ListRecords"];

const OAI_BASE_OBJ = z.union([
  IDENTIFY,
  GET_RECORD,
  LIST_METADATA_FORMATS,
  LIST_SETS,
  LIST_IDENTIFIERS,
  LIST_RECORDS,
]);
type OAIBaseObj = z.infer<typeof OAI_BASE_OBJ>;

const OAI_ERROR_CODE = z.union([
  z.literal("badArgument"),
  z.literal("badResumptionToken"),
  z.literal("badVerb"),
  z.literal("cannotDisseminateFormat"),
  z.literal("idDoesNotExist"),
  z.literal("noRecordsMatch"),
  z.literal("noMetadataFormats"),
  z.literal("noSetHierarchy"),
]);
type OAIErrorCode = z.infer<typeof OAI_ERROR_CODE>;

const OAI_ERROR_OBJ = z.object({
  error: z.strictObject({
    "#text": z.string().optional(),
    "@_code": OAI_ERROR_CODE,
  }),
});

const OAI_RESPONSE = z.object({
  "OAI-PMH": OAI_BASE_OBJ.or(OAI_ERROR_OBJ),
});

export { OAI_RESPONSE };

export type {
  OAIBaseObj,
  OAIErrorCode,
  OAIMetadataFormat,
  OAIMetadataFormatMaybeArr,
  OAIRecord,
  OAIRecordHeader,
  OAIRecordHeaderMaybeArr,
  OAIRecordMaybeArr,
  OAIRepositoryDescription,
  OAISet,
  OAISetMaybeArr,
  ResumptionTokenResponses,
};
