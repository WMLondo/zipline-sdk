import type { ZiplineTransport } from "../transport.js";
import type {
  CreateUrlParams,
  PasswordUrlParams,
  UpdateUrlParams,
  ZiplineUrl,
  ZiplineUrlCreateResponse,
  ZiplineUrlDeleteResponse,
  ZiplineUrlListQuery,
  ZiplineUrlListResponse,
  ZiplineUrlPasswordResponse,
  ZiplineUrlUpdateResponse,
} from "../types.js";
import { encodeResourceId } from "./utils.js";

export class UrlsResource {
  public constructor(private readonly transport: ZiplineTransport) {}

  public list(params?: ZiplineUrlListQuery): Promise<ZiplineUrlListResponse> {
    return this.transport.request<ZiplineUrlListResponse>({
      method: "GET",
      path: "/user/urls",
      ...(params === undefined ? {} : { query: params }),
    });
  }

  public create(params: CreateUrlParams): Promise<ZiplineUrlCreateResponse> {
    return this.transport.request<ZiplineUrlCreateResponse>({
      method: "POST",
      path: "/user/urls",
      body: params,
    });
  }

  public get({ id }: { id: string }): Promise<ZiplineUrl> {
    return this.transport.request<ZiplineUrl>({
      method: "GET",
      path: `/user/urls/${encodeResourceId(id)}`,
    });
  }

  public update({
    id,
    ...body
  }: UpdateUrlParams): Promise<ZiplineUrlUpdateResponse> {
    return this.transport.request<ZiplineUrlUpdateResponse>({
      method: "PATCH",
      path: `/user/urls/${encodeResourceId(id)}`,
      body,
    });
  }

  public delete({ id }: { id: string }): Promise<ZiplineUrlDeleteResponse> {
    return this.transport.request<ZiplineUrlDeleteResponse>({
      method: "DELETE",
      path: `/user/urls/${encodeResourceId(id)}`,
    });
  }

  public verifyPassword({
    id,
    password,
  }: PasswordUrlParams): Promise<ZiplineUrlPasswordResponse> {
    return this.transport.request<ZiplineUrlPasswordResponse>({
      method: "POST",
      path: `/user/urls/${encodeResourceId(id)}/password`,
      body: { password },
    });
  }
}
