import { copyFile, mkdir } from "node:fs/promises";

await mkdir("dist/generated", { recursive: true });
await copyFile(
  "src/generated/zipline-api.d.ts",
  "dist/generated/zipline-api.d.ts",
);
