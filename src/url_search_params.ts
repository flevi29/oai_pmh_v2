type SearchParamsRecord = Record<string, string | undefined>;

function appendRecordToUrlSearchParams(
  record: SearchParamsRecord,
) {
  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(record)) {
    switch (typeof val) {
      case "undefined":
        continue;
      default:
        searchParams.set(key, val);
    }
  }
  return searchParams;
}

export function getURLWithParameters(
  url: string,
  record?: SearchParamsRecord,
) {
  if (record === undefined) {
    return url;
  }
  const searchParams = appendRecordToUrlSearchParams(record);
  return url + "?" + searchParams.toString();
}
