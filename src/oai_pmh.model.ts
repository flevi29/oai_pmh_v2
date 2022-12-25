type ListOptions = {
  from?: string;
  until?: string;
  set?: string;
  metadataPrefix: string;
};

type RequestOptions = {
  signal?: AbortSignal;
  retry?: number;
};

type OaiPmhOptionsConstructor = {
  baseUrl: URL | string;
  userAgent?: string;
};

export type {
  ListOptions,
  OaiPmhOptionsConstructor,
  RequestOptions,
};
