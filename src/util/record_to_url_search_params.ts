export function recordToUrlSearchParams(
  record: Record<string, undefined | string>,
) {
  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(record)) {
    if (val === undefined) continue;
    searchParams.set(key, val);
  }
  return searchParams;
}
