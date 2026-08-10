import { ZiplineApiError, isJsonErrorPayload } from "./errors.js";
import type { JsonErrorPayload, OptionsZipline } from "./types.js";

type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
type ResponseType = "blob" | "json" | "text";

export type TransportRequest = {
  method: HttpMethod;
  path: string;
  query?: Readonly<Record<string, unknown>>;
  body?: unknown;
  headers?: HeadersInit;
  responseType?: ResponseType;
  signal?: AbortSignal;
};

const isNativeBody = (value: unknown): value is FormData | Blob | string =>
  typeof value === "string" ||
  value instanceof FormData ||
  value instanceof Blob;

const parseJson = (text: string): unknown => {
  if (text.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const getErrorPayload = (
  value: unknown,
  response: Response,
): JsonErrorPayload => {
  if (isJsonErrorPayload(value)) {
    return value;
  }

  return {
    error:
      typeof value === "string"
        ? value
        : response.statusText || "Zipline request failed",
    statusCode: response.status,
  };
};

const toQueryValue = (value: unknown): string | undefined => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return undefined;
};

export class ZiplineTransport {
  private readonly apiBaseUrl: URL;
  private readonly defaultHeaders: Headers;
  private readonly fetchFunction: typeof globalThis.fetch;
  private readonly token: string | undefined;
  private readonly cookie: string | undefined;

  public constructor(options: OptionsZipline) {
    const baseUrl = new URL(options.baseUrl);
    baseUrl.hash = "";
    baseUrl.search = "";

    const pathname = baseUrl.pathname.replace(/\/+$/, "");
    const apiPath = pathname.endsWith("/api") ? pathname : `${pathname}/api`;
    baseUrl.pathname = `${apiPath}/`;

    this.apiBaseUrl = baseUrl;
    this.defaultHeaders = new Headers(options.headers);
    this.fetchFunction = options.fetch ?? globalThis.fetch;
    this.token = options.token;
    this.cookie = options.cookie;
  }

  public async request<TResponse>(
    params: TransportRequest,
  ): Promise<TResponse> {
    const url = this.buildUrl(params.path, params.query);
    const headers = new Headers(this.defaultHeaders);

    if (params.headers !== undefined) {
      for (const [key, value] of new Headers(params.headers)) {
        headers.set(key, value);
      }
    }

    if (this.token !== undefined) {
      headers.set("authorization", this.token);
    }

    if (this.cookie !== undefined) {
      headers.set("cookie", this.cookie);
    }

    const requestInit: RequestInit = {
      method: params.method,
      headers,
    };

    if (params.signal !== undefined) {
      requestInit.signal = params.signal;
    }

    if (params.body !== undefined) {
      if (isNativeBody(params.body)) {
        requestInit.body = params.body;
      } else {
        requestInit.body = JSON.stringify(params.body);
        if (!headers.has("content-type")) {
          headers.set("content-type", "application/json");
        }
      }
    }

    const response = await this.fetchFunction(url, requestInit);

    if (!response.ok) {
      throw await this.createApiError(response);
    }

    return this.readResponse<TResponse>(
      response,
      params.responseType ?? "json",
    );
  }

  private buildUrl(
    path: string,
    query: Readonly<Record<string, unknown>> | undefined,
  ): URL {
    const url = new URL(path.replace(/^\/+/, ""), this.apiBaseUrl);

    if (query !== undefined) {
      for (const key of Object.keys(query)) {
        const value = query[key];

        if (value === undefined || value === null) {
          continue;
        }

        if (Array.isArray(value)) {
          for (const item of value) {
            const queryValue = toQueryValue(item);

            if (queryValue !== undefined) {
              url.searchParams.append(key, queryValue);
            }
          }
          continue;
        }

        const queryValue = toQueryValue(value);

        if (queryValue !== undefined) {
          url.searchParams.set(key, queryValue);
        }
      }
    }

    return url;
  }

  private async createApiError(response: Response): Promise<ZiplineApiError> {
    const payload = getErrorPayload(parseJson(await response.text()), response);
    const statusCode = payload.statusCode ?? response.status;

    return new ZiplineApiError({
      message: payload.error,
      statusCode,
      ...(payload.code === undefined ? {} : { code: payload.code }),
      error: payload.error,
    });
  }

  private async readResponse<TResponse>(
    response: Response,
    responseType: ResponseType,
  ): Promise<TResponse> {
    if (responseType === "blob") {
      return (await response.blob()) as TResponse;
    }

    const text = await response.text();

    if (responseType === "text") {
      return text as TResponse;
    }

    return parseJson(text) as TResponse;
  }
}
