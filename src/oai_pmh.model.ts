type ListOptions = {
  from?: string;
  until?: string;
  set?: string;
  metadataPrefix: string;
} | { identifier?: string };

type RequestOptions = {
  signal?: AbortSignal;
  retry?: number;
};

type BaseOptions = {
  baseUrl: URL;
  userAgent: { "User-Agent": string };
};
type OaiPmhOptionsConstructor = {
  baseUrl: string;
  userAgent?: string;
};

export type {
  BaseOptions,
  ListOptions,
  OaiPmhOptionsConstructor,
  RequestOptions,
};
