const DELIMITER = "|", URLS_INDEX = "0", VALID_URLS_INDEX = "1";

function getURLs(): string[] | null {
  const rawURLs = localStorage.getItem(URLS_INDEX);
  return rawURLs === null
    ? null
    : rawURLs === ""
    ? []
    : rawURLs.split(DELIMITER);
}

function setURLs(urls: string[]): void {
  localStorage.setItem(URLS_INDEX, urls.join(DELIMITER));
}

function getValidURLs(): string[] | null {
  const rawURLs = localStorage.getItem(VALID_URLS_INDEX);
  return rawURLs === null || rawURLs === "" ? null : rawURLs.split(DELIMITER);
}

function setValidURLs(urls: string[]): void {
  localStorage.setItem(VALID_URLS_INDEX, urls.join(DELIMITER));
}

export { getURLs, getValidURLs, setURLs, setValidURLs };
