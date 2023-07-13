import { z } from "../../../deps.ts";

const STRING_OBJ = z.object({ val: z.string() });
const STRING_OBJ_TUPLE = z.tuple([STRING_OBJ]);

const RESUMPTION_TOKEN = z.tuple([z.object({
  // optional because some providers return an empty tag
  val: z.string().optional(),
})]);

export { RESUMPTION_TOKEN, STRING_OBJ, STRING_OBJ_TUPLE };
