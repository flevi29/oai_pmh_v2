type ListOptions = {
  from?: string;
  until?: string;
  set?: string;
  metadataPrefix: string;
};

type RequestOptions = {
  signal?: AbortSignal;
  retry?: number;
  retryInterval?: number;
};

type OAIPMHOptionsConstructor = {
  baseUrl: URL | string;
  userAgent?: string;
  debugLogRetries?: boolean;
};

export type { ListOptions, OAIPMHOptionsConstructor, RequestOptions };
