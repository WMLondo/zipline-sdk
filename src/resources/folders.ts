import type { ZiplineTransport } from "../transport.js";
import type {
  GetFolderParams,
  MoveFolderParams,
  UpdateFolderParams,
  ZiplineFolder,
  ZiplineFolderCreate,
  ZiplineFolderCreateResponse,
  ZiplineFolderDeleteResponse,
  ZiplineFolderListQuery,
  ZiplineFolderListResponse,
  ZiplineFolderMoveResponse,
  ZiplineFolderUpdateResponse,
} from "../types.js";
import { encodeResourceId } from "./utils.js";

export class FoldersResource {
  public constructor(private readonly transport: ZiplineTransport) {}

  public list(
    params?: ZiplineFolderListQuery,
  ): Promise<ZiplineFolderListResponse> {
    return this.transport.request<ZiplineFolderListResponse>({
      method: "GET",
      path: "/user/folders",
      ...(params === undefined ? {} : { query: params }),
    });
  }

  public create(
    params: ZiplineFolderCreate,
  ): Promise<ZiplineFolderCreateResponse> {
    return this.transport.request<ZiplineFolderCreateResponse>({
      method: "POST",
      path: "/user/folders",
      body: params,
    });
  }

  public get({ id, ...query }: GetFolderParams): Promise<ZiplineFolder> {
    return this.transport.request<ZiplineFolder>({
      method: "GET",
      path: `/user/folders/${encodeResourceId(id)}`,
      query,
    });
  }

  public update({
    id,
    ...body
  }: UpdateFolderParams): Promise<ZiplineFolderUpdateResponse> {
    return this.transport.request<ZiplineFolderUpdateResponse>({
      method: "PATCH",
      path: `/user/folders/${encodeResourceId(id)}`,
      body,
    });
  }

  public delete({ id }: { id: string }): Promise<ZiplineFolderDeleteResponse> {
    return this.transport.request<ZiplineFolderDeleteResponse>({
      method: "DELETE",
      path: `/user/folders/${encodeResourceId(id)}`,
    });
  }

  public move({
    id,
    ...body
  }: MoveFolderParams): Promise<ZiplineFolderMoveResponse> {
    return this.transport.request<ZiplineFolderMoveResponse>({
      method: "PUT",
      path: `/user/folders/${encodeResourceId(id)}`,
      body,
    });
  }

  public export({ id }: { id: string }): Promise<Blob> {
    return this.transport.request<Blob>({
      method: "GET",
      path: `/user/folders/${encodeResourceId(id)}/export`,
      responseType: "blob",
    });
  }
}
