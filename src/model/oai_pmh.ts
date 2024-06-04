type ListOptions = {
  from?: string;
  until?: string;
  set?: string;
  metadataPrefix: string;
};

type OAIPMHRequestConstructorOptions = {
  baseURL: URL | string;
  init?: RequestInit;
  domParser?: typeof DOMParser;
};

export type { ListOptions, OAIPMHRequestConstructorOptions };
