import { z } from "../../../deps.ts";
import { RESUMPTION_TOKEN, STRING_OBJ, STRING_OBJ_TUPLE } from "./shared.ts";

const HEADER = z.object({
  attr: z.strictObject({
    "@_status": z.literal("deleted"),
  }).optional(),
  val: z.strictObject({
    identifier: STRING_OBJ_TUPLE,
    datestamp: STRING_OBJ_TUPLE,
    setSpec: z.array(STRING_OBJ).optional(),
  }),
});
type OAIPMHHeader = z.infer<typeof HEADER>;

const LIST_IDENTIFIERS_REPONSE = z.object({
  ListIdentifiers: z.tuple([
    z.object({
      val: z.strictObject({
        header: z.array(HEADER),
        resumptionToken: RESUMPTION_TOKEN.optional(),
      }),
    }),
  ]),
});

export { HEADER, LIST_IDENTIFIERS_REPONSE, type OAIPMHHeader };
