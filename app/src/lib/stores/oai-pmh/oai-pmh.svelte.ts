import { OAIPMH } from "oai_pmh_v2/mod";

const LAST_OAI_PMH_URL_KEY = "lastOaiPmhUrl";

export const oai = (() => {
  let url = $state<string>(localStorage.getItem(LAST_OAI_PMH_URL_KEY) ?? "");
  const oaiPMH = $derived.by(() => {
    try {
      return new OAIPMH({
        baseUrl: url,
        requestFn: async (input, init) => {
          const { url } = new Request(input);
          console.log(url);
          const corsProxiedUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

          const resp = await fetch(corsProxiedUrl, init);
          const parsedBody = await resp.text();

          return resp.ok
            ? { success: true, value: parsedBody, headers: resp.headers }
            : { success: false, value: parsedBody, details: resp };
        },
      });
    } catch {
      return null;
    }
  });

  return {
    get url() {
      return url;
    },
    get oaiPMH() {
      return oaiPMH;
    },
    setURL(value: string): void {
      url = value;
      localStorage.setItem(LAST_OAI_PMH_URL_KEY, value);
    },
  };
})();
