# @wmlondo/zipline-sdk

SDK nativo de TypeScript para la API de [Zipline](https://zipline.diced.sh/), orientado a Node.js 24.18.0 o superior.

## Instalación

```bash
npm install @wmlondo/zipline-sdk
```

## Uso rápido

```ts
import { ZiplineClient } from "@wmlondo/zipline-sdk";

const ziplineClient = new ZiplineClient({
  baseUrl: "https://zipline.example.com",
  token: process.env.ZIPLINE_TOKEN,
});

const result = await ziplineClient.files.upload({
  files: ["./screenshots/example.png"],
  folderId: "folder-id",
  shouldPreserveOriginalName: true,
});

console.log(result.files[0]?.url);
```

`baseUrl` puede ser la URL de la instancia o terminar en `/api`; el cliente normaliza ambas formas. El SDK envía el token directamente como el header `Authorization` que espera Zipline. También puedes proporcionar una cookie de sesión:

```ts
const ziplineClient = new ZiplineClient({
  baseUrl: "https://zipline.example.com",
  cookie: "zipline_session=session-value",
});
```

## Recursos

Todos los métodos reciben un objeto y devuelven una `Promise` con tipos derivados del OpenAPI oficial de Zipline.

- `client.files`: upload, list, get, update, delete, raw, verificación de password, archivos incompletos y operaciones masivas.
- `client.folders`: list, create, get, update, delete, move y export.
- `client.urls`: list, create, get, update, delete y verificación de password.
- `client.tags`: list, create, get, update y delete.

El upload acepta rutas locales, `Uint8Array`, `Blob`, `File`, `ReadableStream` y async iterables. Para respuestas de upload en texto, usa `shouldReturnPlainText: true`:

```ts
const urls = await ziplineClient.files.upload({
  files: [{ source: new Uint8Array([1, 2, 3]), name: "data.bin" }],
  shouldReturnPlainText: true,
});
```

El método `files.raw` devuelve un `Blob`, y `folders.export` devuelve el ZIP como `Blob`.

## Errores

Las respuestas HTTP no exitosas lanzan `ZiplineApiError`:

```ts
import { ZiplineApiError } from "@wmlondo/zipline-sdk";

try {
  await ziplineClient.files.get({ id: "missing-file" });
} catch (error) {
  if (error instanceof ZiplineApiError) {
    console.error(error.statusCode, error.code, error.error);
  }
}
```

## Desarrollo

```bash
npm install
npm run generate:api
npm run typecheck
npm run typecheck:test
npm test
npm run lint
npm run format:check
npm run build
npm run pack:check
```

La especificación generada se obtiene de `https://zipline.diced.sh/openapi.json`. Los uploads parciales/chunked, OAuth, MFA, administración y login con usuario/password no forman parte de esta primera versión.

## Licencia

MIT
