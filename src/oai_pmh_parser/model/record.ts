import { z } from "../../../deps.ts";
import { HEADER } from "./header.ts";
import { RESUMPTION_TOKEN } from "./shared.ts";
import { TRANSFORMED_PARSED_XML_VALUE } from "./transform.ts";

const RECORD = z.object({
  val: z.strictObject({
    header: z.tuple([HEADER]),
    metadata: z.tuple([z.lazy(() => TRANSFORMED_PARSED_XML_VALUE)]).optional(),
    about: z.array(z.lazy(() => TRANSFORMED_PARSED_XML_VALUE)).optional(),
  }),
});
type OAIPMHRecord = z.infer<typeof RECORD>;

const GET_RECORD_REPONSE = z.object({
  GetRecord: z.tuple([
    z.object({ val: z.strictObject({ record: z.tuple([RECORD]) }) }),
  ]),
});

const LIST_RECORDS_REPONSE = z.object({
  ListRecords: z.tuple([
    z.object({
      val: z.strictObject({
        record: z.array(RECORD),
        resumptionToken: RESUMPTION_TOKEN.optional(),
      }),
    }),
  ]),
});

export { GET_RECORD_REPONSE, LIST_RECORDS_REPONSE, type OAIPMHRecord };
