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

type OAIPMHRequestConstructorOptions = {
  baseURL: URL | string;
  userAgent?: string;
  debugLogRetries?: boolean;
  domParser?: typeof DOMParser;
};

export type { ListOptions, OAIPMHRequestConstructorOptions, RequestOptions };
