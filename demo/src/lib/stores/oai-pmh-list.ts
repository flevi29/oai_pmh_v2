const DELIMITER = "|", URLS_INDEX = "0", VALID_URLS_INDEX = "1";

function getURLs(): string[] | null {
  const rawURLs = localStorage.getItem(URLS_INDEX);
  return rawURLs === null ? null : rawURLs.split(DELIMITER);
}

function setURLs(value: string[]): void {
  localStorage.setItem(URLS_INDEX, value.join(DELIMITER));
}

function getValidURLs(): string[] | null {
  const rawURLs = localStorage.getItem(VALID_URLS_INDEX);
  return rawURLs === null ? null : rawURLs.split(DELIMITER);
}

function setValidURLs(value: string[]): void {
  localStorage.setItem(VALID_URLS_INDEX, value.join(DELIMITER));
}

export { getURLs, getValidURLs, setURLs, setValidURLs };
