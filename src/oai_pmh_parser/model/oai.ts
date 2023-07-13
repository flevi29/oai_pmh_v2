import { z } from "../../../deps.ts";
import { LIST_IDENTIFIERS_REPONSE } from "./header.ts";
import { IDENTIFY_REPONSE } from "./identify.ts";
import { LIST_METADATA_FORMATS_REPONSE } from "./metadata_format.ts";
import { GET_RECORD_REPONSE, LIST_RECORDS_REPONSE } from "./record.ts";
import { LIST_SETS_REPONSE } from "./set.ts";

const SUCCES_RESPONSE = z.union([
  IDENTIFY_REPONSE,
  GET_RECORD_REPONSE,
  LIST_IDENTIFIERS_REPONSE,
  LIST_METADATA_FORMATS_REPONSE,
  LIST_RECORDS_REPONSE,
  LIST_SETS_REPONSE,
]);
type OAIPMHSuccessResponse = z.infer<typeof SUCCES_RESPONSE>;
type ResumptionTokenResponse =
  | z.infer<typeof LIST_IDENTIFIERS_REPONSE>["ListIdentifiers"]
  | z.infer<typeof LIST_RECORDS_REPONSE>["ListRecords"]
  | z.infer<typeof LIST_SETS_REPONSE>["ListSets"];

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
type OAIPMHErrorCode = z.infer<typeof OAI_ERROR_CODE>;

const ERROR_RESPONSE = z.object({
  error: z.array(
    z.object({
      attr: z.strictObject({ "@_code": OAI_ERROR_CODE }),
      val: z.string().optional(),
    }),
  ),
});
type OAIPMHErrorResponse = z.infer<typeof ERROR_RESPONSE>["error"];

const RESPONSE = z.strictObject({
  "OAI-PMH": z.tuple([
    z.object({
      val: z.union([SUCCES_RESPONSE, ERROR_RESPONSE]),
    }),
  ]),
});

export {
  type OAIPMHErrorCode,
  type OAIPMHErrorResponse,
  type OAIPMHSuccessResponse,
  RESPONSE,
  type ResumptionTokenResponse,
};
