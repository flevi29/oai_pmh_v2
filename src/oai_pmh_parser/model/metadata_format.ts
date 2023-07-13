import { z } from "../../../deps.ts";
import { STRING_OBJ_TUPLE } from "./shared.ts";

const METADATA_FORMAT = z.object({
  val: z.strictObject({
    metadataPrefix: STRING_OBJ_TUPLE,
    schema: STRING_OBJ_TUPLE,
    metadataNamespace: STRING_OBJ_TUPLE,
  }),
});
type OAIPMHMetadataFormat = z.infer<typeof METADATA_FORMAT>;

const LIST_METADATA_FORMATS_REPONSE = z.object({
  ListMetadataFormats: z.tuple([
    z.object({
      val: z.strictObject({
        metadataFormat: z.array(METADATA_FORMAT),
      }),
    }),
  ]),
});

export { LIST_METADATA_FORMATS_REPONSE, type OAIPMHMetadataFormat };
