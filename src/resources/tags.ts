import type { ZiplineTransport } from "../transport.js";
import type {
  CreateTagParams,
  UpdateTagParams,
  ZiplineTag,
  ZiplineTagCreateResponse,
  ZiplineTagDeleteResponse,
  ZiplineTagListResponse,
  ZiplineTagUpdateResponse,
} from "../types.js";
import { encodeResourceId } from "./utils.js";

export class TagsResource {
  public constructor(private readonly transport: ZiplineTransport) {}

  public list(): Promise<ZiplineTagListResponse> {
    return this.transport.request<ZiplineTagListResponse>({
      method: "GET",
      path: "/user/tags",
    });
  }

  public create(params: CreateTagParams): Promise<ZiplineTagCreateResponse> {
    return this.transport.request<ZiplineTagCreateResponse>({
      method: "POST",
      path: "/user/tags",
      body: params,
    });
  }

  public get({ id }: { id: string }): Promise<ZiplineTag> {
    return this.transport.request<ZiplineTag>({
      method: "GET",
      path: `/user/tags/${encodeResourceId(id)}`,
    });
  }

  public update({
    id,
    ...body
  }: UpdateTagParams): Promise<ZiplineTagUpdateResponse> {
    return this.transport.request<ZiplineTagUpdateResponse>({
      method: "PATCH",
      path: `/user/tags/${encodeResourceId(id)}`,
      body,
    });
  }

  public delete({ id }: { id: string }): Promise<ZiplineTagDeleteResponse> {
    return this.transport.request<ZiplineTagDeleteResponse>({
      method: "DELETE",
      path: `/user/tags/${encodeResourceId(id)}`,
    });
  }
}
