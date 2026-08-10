import { FilesResource } from "./resources/files.js";
import { FoldersResource } from "./resources/folders.js";
import { TagsResource } from "./resources/tags.js";
import { UrlsResource } from "./resources/urls.js";
import { ZiplineTransport } from "./transport.js";
import type { OptionsZipline } from "./types.js";

export class ZiplineClient {
  public readonly files: FilesResource;
  public readonly folders: FoldersResource;
  public readonly tags: TagsResource;
  public readonly urls: UrlsResource;

  public constructor(options: OptionsZipline) {
    const transport = new ZiplineTransport(options);

    this.files = new FilesResource(transport);
    this.folders = new FoldersResource(transport);
    this.tags = new TagsResource(transport);
    this.urls = new UrlsResource(transport);
  }
}
