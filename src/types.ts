import type { paths } from "./generated/zipline-api.js";

type JsonResponse<TOperation> = TOperation extends {
  responses: { 200: { content: { "application/json": infer TData } } };
}
  ? TData
  : never;

type JsonRequestBody<TOperation> = TOperation extends {
  requestBody: { content: { "application/json": infer TData } };
}
  ? TData
  : never;

export type OptionsZipline = {
  baseUrl: string;
  token?: string;
  cookie?: string;
  headers?: HeadersInit;
  fetch?: typeof globalThis.fetch;
};

export type ZiplineFile = JsonResponse<paths["/api/user/files/{id}"]["get"]>;
export type ZiplineFileListQuery =
  paths["/api/user/files"]["get"]["parameters"]["query"];
export type ZiplineFileListResponse = JsonResponse<
  paths["/api/user/files"]["get"]
>;
export type ZiplineFileUpdate = JsonRequestBody<
  paths["/api/user/files/{id}"]["patch"]
>;
export type ZiplineFileUpdateResponse = JsonResponse<
  paths["/api/user/files/{id}"]["patch"]
>;
export type ZiplineFileDeleteResponse = JsonResponse<
  paths["/api/user/files/{id}"]["delete"]
>;
export type ZiplineFilePasswordResponse = JsonResponse<
  paths["/api/user/files/{id}/password"]["post"]
>;
export type ZiplineFilePasswordRequest = JsonRequestBody<
  paths["/api/user/files/{id}/password"]["post"]
>;
export type ZiplineFileRawQuery =
  paths["/api/user/files/{id}/raw"]["get"]["parameters"]["query"];
export type ZiplineIncompleteFile = JsonResponse<
  paths["/api/user/files/incomplete"]["get"]
>[number];
export type ZiplineIncompleteFileDeleteRequest = JsonRequestBody<
  paths["/api/user/files/incomplete"]["delete"]
>;
export type ZiplineIncompleteFileDeleteResponse = JsonResponse<
  paths["/api/user/files/incomplete"]["delete"]
>;
export type ZiplineFileTransactionUpdate = JsonRequestBody<
  paths["/api/user/files/transaction"]["patch"]
>;
export type ZiplineFileTransactionUpdateResponse = JsonResponse<
  paths["/api/user/files/transaction"]["patch"]
>;
export type ZiplineFileTransactionDelete = JsonRequestBody<
  paths["/api/user/files/transaction"]["delete"]
>;
export type ZiplineFileTransactionDeleteResponse = JsonResponse<
  paths["/api/user/files/transaction"]["delete"]
>;

export type ZiplineFolderListQuery =
  paths["/api/user/folders"]["get"]["parameters"]["query"];
export type ZiplineFolderListResponse = JsonResponse<
  paths["/api/user/folders"]["get"]
>;
export type ZiplineFolderCreate = JsonRequestBody<
  paths["/api/user/folders"]["post"]
>;
export type ZiplineFolderCreateResponse = JsonResponse<
  paths["/api/user/folders"]["post"]
>;
export type ZiplineFolderGetQuery =
  paths["/api/user/folders/{id}"]["get"]["parameters"]["query"];
export type ZiplineFolder = JsonResponse<
  paths["/api/user/folders/{id}"]["get"]
>;
export type ZiplineFolderUpdate = JsonRequestBody<
  paths["/api/user/folders/{id}"]["patch"]
>;
export type ZiplineFolderUpdateResponse = JsonResponse<
  paths["/api/user/folders/{id}"]["patch"]
>;
export type ZiplineFolderDeleteResponse = JsonResponse<
  paths["/api/user/folders/{id}"]["delete"]
>;
export type ZiplineFolderMove = JsonRequestBody<
  paths["/api/user/folders/{id}"]["put"]
>;
export type ZiplineFolderMoveResponse = JsonResponse<
  paths["/api/user/folders/{id}"]["put"]
>;

export type ZiplineUrlListQuery =
  paths["/api/user/urls"]["get"]["parameters"]["query"];
export type ZiplineUrlListResponse = JsonResponse<
  paths["/api/user/urls"]["get"]
>;
export type ZiplineUrlCreate = JsonRequestBody<paths["/api/user/urls"]["post"]>;
export type ZiplineUrlCreateResponse = JsonResponse<
  paths["/api/user/urls"]["post"]
>;
export type ZiplineUrl = JsonResponse<paths["/api/user/urls/{id}"]["get"]>;
export type ZiplineUrlUpdate = JsonRequestBody<
  paths["/api/user/urls/{id}"]["patch"]
>;
export type ZiplineUrlUpdateResponse = JsonResponse<
  paths["/api/user/urls/{id}"]["patch"]
>;
export type ZiplineUrlDeleteResponse = JsonResponse<
  paths["/api/user/urls/{id}"]["delete"]
>;
export type ZiplineUrlPasswordRequest = JsonRequestBody<
  paths["/api/user/urls/{id}/password"]["post"]
>;
export type ZiplineUrlPasswordResponse = JsonResponse<
  paths["/api/user/urls/{id}/password"]["post"]
>;

export type ZiplineTagListResponse = JsonResponse<
  paths["/api/user/tags"]["get"]
>;
export type ZiplineTagCreate = JsonRequestBody<paths["/api/user/tags"]["post"]>;
export type ZiplineTagCreateResponse = JsonResponse<
  paths["/api/user/tags"]["post"]
>;
export type ZiplineTag = JsonResponse<paths["/api/user/tags/{id}"]["get"]>;
export type ZiplineTagUpdate = JsonRequestBody<
  paths["/api/user/tags/{id}"]["patch"]
>;
export type ZiplineTagUpdateResponse = JsonResponse<
  paths["/api/user/tags/{id}"]["patch"]
>;
export type ZiplineTagDeleteResponse = JsonResponse<
  paths["/api/user/tags/{id}"]["delete"]
>;

export type UploadSource =
  | string
  | Uint8Array
  | Blob
  | {
      source:
        | string
        | Uint8Array
        | Blob
        | ReadableStream<Uint8Array>
        | AsyncIterable<Uint8Array>;
      name: string;
      type?: string;
    };

export type ZiplineUploadFormat =
  "random" | "date" | "uuid" | "name" | "gfycat";
export type ZiplineImageCompressionType = "jpg" | "png" | "webp" | "jxl";

export type ZiplineUploadOptions = {
  deletesAt?: string | Date;
  format?: ZiplineUploadFormat;
  imageCompressionPercent?: number;
  imageCompressionType?: ZiplineImageCompressionType;
  password?: string;
  maxViews?: number;
  shouldPreserveOriginalName?: boolean;
  folderId?: string;
  filename?: string;
  domain?: string;
  fileExtension?: string;
  shouldReturnPlainText?: boolean;
};

export type ZiplineUploadParams = {
  files: ReadonlyArray<UploadSource>;
} & ZiplineUploadOptions;

export type ZiplineUploadResponse = JsonResponse<paths["/api/upload"]["post"]>;
export type ZiplineUploadJsonResponse = Exclude<ZiplineUploadResponse, string>;
export type ZiplineUploadFile = ZiplineUploadJsonResponse["files"][number];

export type FileIdParams = { id: string };
export type UpdateFileParams = FileIdParams & ZiplineFileUpdate;
export type PasswordFileParams = FileIdParams & ZiplineFilePasswordRequest;
export type RawFileParams = FileIdParams & ZiplineFileRawQuery;
export type IncompleteFileDeleteParams = ZiplineIncompleteFileDeleteRequest;
export type FileTransactionUpdateParams = ZiplineFileTransactionUpdate;
export type FileTransactionDeleteParams = ZiplineFileTransactionDelete;

export type FolderIdParams = { id: string };
export type GetFolderParams = FolderIdParams & ZiplineFolderGetQuery;
export type UpdateFolderParams = FolderIdParams & ZiplineFolderUpdate;
export type MoveFolderParams = FolderIdParams & ZiplineFolderMove;

export type UrlIdParams = { id: string };
export type CreateUrlParams = ZiplineUrlCreate;
export type UpdateUrlParams = UrlIdParams & ZiplineUrlUpdate;
export type PasswordUrlParams = UrlIdParams & ZiplineUrlPasswordRequest;

export type TagIdParams = { id: string };
export type CreateTagParams = ZiplineTagCreate;
export type UpdateTagParams = TagIdParams & ZiplineTagUpdate;

export type JsonErrorPayload = {
  error: string;
  code?: number;
  statusCode?: number;
};
