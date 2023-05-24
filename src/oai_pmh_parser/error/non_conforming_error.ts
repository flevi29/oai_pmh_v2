import { type ZodError } from "../../../deps.ts";
import { type ExpectedKeyError } from "./expected_key_error.ts";

export class NonConformingError extends Error {
  constructor(error: ZodError | ExpectedKeyError) {
    super("returned data does not conform to OAI-PMH");
    this.name = NonConformingError.name;
    this.cause = error;
  }
}
