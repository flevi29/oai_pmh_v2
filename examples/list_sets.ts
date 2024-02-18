import { oaiPmh, STATUS } from "./shared.ts";

const g = oaiPmh.listSets({ signal: AbortSignal.timeout(60_000) });

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
