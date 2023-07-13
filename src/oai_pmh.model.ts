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
  baseUrl: URL | string;
  userAgent?: string;
  debugLogRetries?: boolean;
};

export type { ListOptions, OAIPMHRequestConstructorOptions, RequestOptions };
