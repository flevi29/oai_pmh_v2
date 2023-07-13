import { z } from "../../../deps.ts";
import { STRING_OBJ, STRING_OBJ_TUPLE } from "./shared.ts";
import { TRANSFORMED_PARSED_XML_VALUE } from "./transform.ts";

const IDENTIFY = z.object({
  val: z.strictObject({
    repositoryName: STRING_OBJ_TUPLE,
    baseURL: STRING_OBJ_TUPLE,
    protocolVersion: STRING_OBJ_TUPLE,
    earliestDatestamp: STRING_OBJ_TUPLE,
    deletedRecord: z.tuple([
      z.object({
        val: z.union([
          z.literal("no"),
          z.literal("transient"),
          z.literal("persistent"),
        ]),
      }),
    ]),
    granularity: z.tuple([
      z.object({
        val: z.union([
          z.literal("YYYY-MM-DD"),
          z.literal("YYYY-MM-DDThh:mm:ssZ"),
        ]),
      }),
    ]),
    adminEmail: STRING_OBJ_TUPLE,
    compression: STRING_OBJ.array().optional(),
    description: z.array(z.lazy(() => TRANSFORMED_PARSED_XML_VALUE)).optional(),
  }),
});
type OAIPMHIdentify = z.infer<typeof IDENTIFY>;

const IDENTIFY_REPONSE = z.object({ Identify: z.tuple([IDENTIFY]) });

export { IDENTIFY_REPONSE, type OAIPMHIdentify };
