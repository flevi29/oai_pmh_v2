export function getListOptionsStores(localStorageStartingIndex: number) {
  const fromIndex = String(localStorageStartingIndex),
    untilIndex = String(localStorageStartingIndex + 1),
    setIndex = String(localStorageStartingIndex + 2),
    metadataPrefixIndex = String(localStorageStartingIndex + 3);

  let from = $state<string>(localStorage.getItem(fromIndex) ?? ""),
    until = $state(localStorage.getItem(untilIndex) ?? ""),
    set = $state(localStorage.getItem(setIndex) ?? ""),
    metadataPrefix = $state(localStorage.getItem(metadataPrefixIndex) ?? "");

  return {
    get from() {
      return from;
    },
    setFrom(value: string): void {
      from = value;
      localStorage.setItem(fromIndex, value);
    },
    get until() {
      return until;
    },
    setUntil(value: string): void {
      until = value;
      localStorage.setItem(untilIndex, value);
    },
    get set() {
      return set;
    },
    setSet(value: string): void {
      set = value;
      localStorage.setItem(setIndex, value);
    },
    get metadataPrefix() {
      return metadataPrefix;
    },
    setMetadataPrefix(value: string): void {
      metadataPrefix = value;
      localStorage.setItem(metadataPrefixIndex, value);
    },
  };
}
