import { basename } from "node:path";
import { openAsBlob } from "node:fs";
import type { ZiplineTransport } from "../transport.js";
import type {
  FileIdParams,
  FileTransactionDeleteParams,
  FileTransactionUpdateParams,
  IncompleteFileDeleteParams,
  PasswordFileParams,
  RawFileParams,
  UpdateFileParams,
  UploadSource,
  ZiplineFile,
  ZiplineFileDeleteResponse,
  ZiplineFileListQuery,
  ZiplineFileListResponse,
  ZiplineFilePasswordResponse,
  ZiplineFileTransactionDeleteResponse,
  ZiplineFileTransactionUpdateResponse,
  ZiplineFileUpdateResponse,
  ZiplineIncompleteFile,
  ZiplineIncompleteFileDeleteResponse,
  ZiplineUploadJsonResponse,
  ZiplineUploadParams,
} from "../types.js";
import { encodeResourceId } from "./utils.js";

type PreparedUpload = {
  blob: Blob;
  name: string;
};

const isReadableStream = (
  value: unknown,
): value is ReadableStream<Uint8Array> => value instanceof ReadableStream;

const toReadableStream = (
  source: AsyncIterable<Uint8Array>,
): ReadableStream<Uint8Array> => {
  const iterator = source[Symbol.asyncIterator]();

  return new ReadableStream<Uint8Array>({
    async pull(controller): Promise<void> {
      const result = await iterator.next();

      if (result.done) {
        controller.close();
        return;
      }

      controller.enqueue(result.value);
    },
  });
};

const withMimeType = (blob: Blob, type: string | undefined): Blob =>
  type === undefined ? blob : new Blob([blob], { type });

const copyBytesToArrayBuffer = (source: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(source.byteLength);
  new Uint8Array(buffer).set(source);
  return buffer;
};

const createPreparedUpload = async (
  source: UploadSource,
): Promise<PreparedUpload> => {
  if (typeof source === "string") {
    return {
      blob: await openAsBlob(source),
      name: basename(source),
    };
  }

  if (source instanceof Uint8Array) {
    return {
      blob: new Blob([copyBytesToArrayBuffer(source)]),
      name: "upload.bin",
    };
  }

  if (source instanceof Blob) {
    const name =
      "name" in source && typeof source.name === "string"
        ? source.name
        : "upload.bin";
    return { blob: source, name };
  }

  if (typeof source.source === "string") {
    return {
      blob: withMimeType(await openAsBlob(source.source), source.type),
      name: source.name,
    };
  }

  if (source.source instanceof Uint8Array) {
    return {
      blob: withMimeType(
        new Blob([copyBytesToArrayBuffer(source.source)]),
        source.type,
      ),
      name: source.name,
    };
  }

  if (source.source instanceof Blob) {
    return {
      blob: withMimeType(source.source, source.type),
      name: source.name,
    };
  }

  const stream = isReadableStream(source.source)
    ? source.source
    : toReadableStream(source.source);
  const blob = await new Response(stream).blob();

  return {
    blob: withMimeType(blob, source.type),
    name: source.name,
  };
};

const createUploadHeaders = (
  params: ZiplineUploadParams,
): Record<string, string> => {
  const headers: Record<string, string> = {};

  if (params.deletesAt !== undefined) {
    headers["x-zipline-deletes-at"] =
      params.deletesAt instanceof Date
        ? params.deletesAt.toISOString()
        : params.deletesAt;
  }
  if (params.format !== undefined) headers["x-zipline-format"] = params.format;
  if (params.imageCompressionPercent !== undefined) {
    headers["x-zipline-image-compression-percent"] = String(
      params.imageCompressionPercent,
    );
  }
  if (params.imageCompressionType !== undefined) {
    headers["x-zipline-image-compression-type"] = params.imageCompressionType;
  }
  if (params.password !== undefined)
    headers["x-zipline-password"] = params.password;
  if (params.maxViews !== undefined)
    headers["x-zipline-max-views"] = String(params.maxViews);
  if (params.shouldPreserveOriginalName !== undefined)
    headers["x-zipline-original-name"] = String(
      params.shouldPreserveOriginalName,
    );
  if (params.folderId !== undefined)
    headers["x-zipline-folder"] = params.folderId;
  if (params.filename !== undefined)
    headers["x-zipline-filename"] = params.filename;
  if (params.domain !== undefined) headers["x-zipline-domain"] = params.domain;
  if (params.fileExtension !== undefined)
    headers["x-zipline-file-extension"] = params.fileExtension;
  if (params.shouldReturnPlainText !== undefined)
    headers["x-zipline-no-json"] = String(params.shouldReturnPlainText);

  return headers;
};

export class FilesResource {
  public constructor(private readonly transport: ZiplineTransport) {}

  public async upload(
    params: ZiplineUploadParams & { shouldReturnPlainText: true },
  ): Promise<string>;
  public async upload(
    params: ZiplineUploadParams & { shouldReturnPlainText?: false },
  ): Promise<ZiplineUploadJsonResponse>;
  public async upload(
    params: ZiplineUploadParams,
  ): Promise<string | ZiplineUploadJsonResponse> {
    const form = new FormData();
    const preparedUploads = await Promise.all(
      params.files.map(createPreparedUpload),
    );

    for (const upload of preparedUploads) {
      form.append("file", upload.blob, upload.name);
    }

    if (params.files.length === 0) {
      throw new TypeError("files.upload requires at least one file");
    }

    return this.transport.request<string | ZiplineUploadJsonResponse>({
      method: "POST",
      path: "/upload",
      body: form,
      headers: createUploadHeaders(params),
      responseType: params.shouldReturnPlainText === true ? "text" : "json",
    });
  }

  public list(params: ZiplineFileListQuery): Promise<ZiplineFileListResponse> {
    return this.transport.request<ZiplineFileListResponse>({
      method: "GET",
      path: "/user/files",
      query: params,
    });
  }

  public get({ id }: FileIdParams): Promise<ZiplineFile> {
    return this.transport.request<ZiplineFile>({
      method: "GET",
      path: `/user/files/${encodeResourceId(id)}`,
    });
  }

  public update({
    id,
    ...body
  }: UpdateFileParams): Promise<ZiplineFileUpdateResponse> {
    return this.transport.request<ZiplineFileUpdateResponse>({
      method: "PATCH",
      path: `/user/files/${encodeResourceId(id)}`,
      body,
    });
  }

  public delete({ id }: FileIdParams): Promise<ZiplineFileDeleteResponse> {
    return this.transport.request<ZiplineFileDeleteResponse>({
      method: "DELETE",
      path: `/user/files/${encodeResourceId(id)}`,
    });
  }

  public raw({ id, ...query }: RawFileParams): Promise<Blob> {
    return this.transport.request<Blob>({
      method: "GET",
      path: `/user/files/${encodeResourceId(id)}/raw`,
      query,
      responseType: "blob",
    });
  }

  public verifyPassword({
    id,
    password,
  }: PasswordFileParams): Promise<ZiplineFilePasswordResponse> {
    return this.transport.request<ZiplineFilePasswordResponse>({
      method: "POST",
      path: `/user/files/${encodeResourceId(id)}/password`,
      body: { password },
    });
  }

  public listIncomplete(): Promise<ReadonlyArray<ZiplineIncompleteFile>> {
    return this.transport.request<ReadonlyArray<ZiplineIncompleteFile>>({
      method: "GET",
      path: "/user/files/incomplete",
    });
  }

  public deleteIncomplete(
    params: IncompleteFileDeleteParams,
  ): Promise<ZiplineIncompleteFileDeleteResponse> {
    return this.transport.request<ZiplineIncompleteFileDeleteResponse>({
      method: "DELETE",
      path: "/user/files/incomplete",
      body: params,
    });
  }

  public updateMany(
    params: FileTransactionUpdateParams,
  ): Promise<ZiplineFileTransactionUpdateResponse> {
    return this.transport.request<ZiplineFileTransactionUpdateResponse>({
      method: "PATCH",
      path: "/user/files/transaction",
      body: params,
    });
  }

  public deleteMany(
    params: FileTransactionDeleteParams,
  ): Promise<ZiplineFileTransactionDeleteResponse> {
    return this.transport.request<ZiplineFileTransactionDeleteResponse>({
      method: "DELETE",
      path: "/user/files/transaction",
      body: params,
    });
  }
}
