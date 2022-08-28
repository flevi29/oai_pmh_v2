export function applyRecordToURLSearchParams(
  searchParams: URLSearchParams,
  record: Record<string, undefined | string>,
) {
  for (const [key, val] of Object.entries(record)) {
    if (val === undefined) continue;
    searchParams.set(key, val);
  }
}
