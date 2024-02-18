import { oaiPmh, STATUS } from "./shared.ts";

const result = await oaiPmh.getRecord(
  "oai:bibliotecavirtual.asturias.es:100",
  "marc21",
);

if (result.status === STATUS.OK) {
  console.log(JSON.stringify(result.value));
} else {
  console.error(result.value);
}
