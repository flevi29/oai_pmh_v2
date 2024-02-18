import { oaiPmh, STATUS } from "./shared.ts";

const g = oaiPmh.listRecords(
  { metadataPrefix: "marc21", from: "2015-04-10", until: "2015-10-28" },
  { signal: AbortSignal.timeout(30_000) },
);

for (;;) {
  const { done, value: gVal } = await g.next();

  if (done) {
    const { status, value } = gVal;

    if (status !== STATUS.OK) {
      console.error(value);
    }

    break;
  }

  console.log(JSON.stringify(gVal));
}
