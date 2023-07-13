import { z } from "../../../deps.ts";
import { RESUMPTION_TOKEN, STRING_OBJ_TUPLE } from "./shared.ts";

const SET = z.object({
  val: z.strictObject({
    setName: STRING_OBJ_TUPLE,
    setSpec: STRING_OBJ_TUPLE,
  }),
});
type OAIPMHSet = z.infer<typeof SET>;

const LIST_SETS_REPONSE = z.object({
  ListSets: z.tuple([
    z.object({
      // optional because some providers return empty tag instead of proper error
      val: z.strictObject({
        set: z.array(SET),
        resumptionToken: RESUMPTION_TOKEN.optional(),
      }).optional(),
    }),
  ]),
});

export { LIST_SETS_REPONSE, type OAIPMHSet };
