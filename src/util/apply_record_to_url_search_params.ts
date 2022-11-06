export function applyRecordToURLSearchParams(
  searchParams: URLSearchParams,
  record: Record<string, undefined | string>,
) {
  for (const [key, val] of Object.entries(record)) {
    if (val === void 0) continue;
    searchParams.set(key, val);
  }
}
