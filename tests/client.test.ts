import { describe, expect, it, vi } from "vitest";
import { ZiplineApiError, ZiplineClient } from "../src/index.js";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const getRequestUrl = (
  fetchMock: ReturnType<typeof vi.fn<typeof fetch>>,
): string => {
  const [input] = fetchMock.mock.calls.at(-1) ?? [];

  if (input === undefined) {
    throw new Error("Expected fetch to be called");
  }

  if (input instanceof Request) {
    return input.url;
  }

  return input instanceof URL ? input.toString() : input;
};

describe("ZiplineClient", () => {
  it("should normalize the instance URL and send token and cookie headers", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ page: [], total: 0, pages: 0 }));
    const client = new ZiplineClient({
      baseUrl: "https://zipline.example.test/instance/",
      token: "token-value",
      cookie: "zipline_session=session-value",
      fetch: fetchMock,
    });

    await client.files.list({ page: 2, searchQuery: "summer images" });

    expect(getRequestUrl(fetchMock)).toBe(
      "https://zipline.example.test/instance/api/user/files?page=2&searchQuery=summer+images",
    );

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);
    expect(headers.get("authorization")).toBe("token-value");
    expect(headers.get("cookie")).toBe("zipline_session=session-value");
  });

  it("should upload multiple files as multipart form data with Zipline options", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        files: [
          {
            id: "file-id",
            name: "image.png",
            type: "image/png",
            url: "https://zipline.test/image.png",
          },
        ],
      }),
    );
    const client = new ZiplineClient({
      baseUrl: "https://zipline.test",
      fetch: fetchMock,
    });

    await client.files.upload({
      files: [
        {
          source: new Uint8Array([1, 2, 3]),
          name: "one.bin",
          type: "application/octet-stream",
        },
        { source: new Blob(["two"]), name: "two.txt", type: "text/plain" },
      ],
      folderId: "folder-id",
      shouldPreserveOriginalName: true,
      maxViews: 5,
    });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeInstanceOf(FormData);

    if (!(init?.body instanceof FormData)) {
      throw new Error("Expected a FormData body");
    }

    const files = init.body.getAll("file");
    expect(files).toHaveLength(2);
    const firstFile = files[0];
    const secondFile = files[1];
    expect(firstFile).toBeInstanceOf(File);
    expect(secondFile).toBeInstanceOf(File);

    if (!(firstFile instanceof File) || !(secondFile instanceof File)) {
      throw new Error("Expected uploaded form fields to be Files");
    }

    expect(firstFile.name).toBe("one.bin");
    expect(secondFile.name).toBe("two.txt");

    const headers = new Headers(init.headers);
    expect(headers.get("x-zipline-folder")).toBe("folder-id");
    expect(headers.get("x-zipline-original-name")).toBe("true");
    expect(headers.get("x-zipline-max-views")).toBe("5");
    expect(headers.has("content-type")).toBe(false);
  });

  it("should return plain text when requested", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response("https://zipline.test/file.png\n", { status: 200 }),
      );
    const client = new ZiplineClient({
      baseUrl: "https://zipline.test",
      fetch: fetchMock,
    });

    const result = await client.files.upload({
      files: [{ source: new Uint8Array([1]), name: "file.bin" }],
      shouldReturnPlainText: true,
    });

    expect(result).toBe("https://zipline.test/file.png\n");
    const [, init] = fetchMock.mock.calls[0] ?? [];
    expect(new Headers(init?.headers).get("x-zipline-no-json")).toBe("true");
  });

  it("should encode resource IDs and return binary raw content", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "content-type": "application/octet-stream" },
      }),
    );
    const client = new ZiplineClient({
      baseUrl: "https://zipline.test",
      fetch: fetchMock,
    });

    const result = await client.files.raw({
      id: "folder/file",
      download: "true",
    });

    expect(result).toBeInstanceOf(Blob);
    expect(getRequestUrl(fetchMock)).toBe(
      "https://zipline.test/api/user/files/folder%2Ffile/raw?download=true",
    );
  });

  it("should expose Zipline API error details for non-success responses", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse(
          { error: "not logged in", code: 2002, statusCode: 401 },
          401,
        ),
      );
    const client = new ZiplineClient({
      baseUrl: "https://zipline.test",
      fetch: fetchMock,
    });

    const request = client.tags.list();

    await expect(request).rejects.toBeInstanceOf(ZiplineApiError);
    await expect(request).rejects.toMatchObject({
      error: "not logged in",
      code: 2002,
      statusCode: 401,
    });
  });

  it("should route folders, URLs, and tags through their resource namespaces", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(() =>
        Promise.resolve(jsonResponse({ id: "resource-id" })),
      );
    const client = new ZiplineClient({
      baseUrl: "https://zipline.test",
      fetch: fetchMock,
    });

    await client.folders.get({ id: "folder-id", noincl: "true" });
    expect(getRequestUrl(fetchMock)).toBe(
      "https://zipline.test/api/user/folders/folder-id?noincl=true",
    );

    await client.urls.get({ id: "url-id" });
    expect(getRequestUrl(fetchMock)).toBe(
      "https://zipline.test/api/user/urls/url-id",
    );

    await client.tags.get({ id: "tag-id" });
    expect(getRequestUrl(fetchMock)).toBe(
      "https://zipline.test/api/user/tags/tag-id",
    );
  });
});
