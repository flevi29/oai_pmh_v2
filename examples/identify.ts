import { oaiPmh, STATUS } from "./shared.ts";

const result = await oaiPmh.identify();

if (result.status === STATUS.OK) {
  console.log(JSON.stringify(result.value));
} else {
  console.error(result.value);
}
