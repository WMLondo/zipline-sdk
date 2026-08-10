import type { JsonErrorPayload } from "./types.js";

export class ZiplineApiError extends Error {
  public readonly statusCode: number;
  public readonly code: number | undefined;
  public readonly error: string;

  public constructor({
    message,
    statusCode,
    code,
    error,
    cause,
  }: {
    message: string;
    statusCode: number;
    code?: number;
    error: string;
    cause?: unknown;
  }) {
    super(message, { cause });
    this.name = "ZiplineApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.error = error;
  }
}

export const isJsonErrorPayload = (
  value: unknown,
): value is JsonErrorPayload => {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return false;
  }

  const error = value.error;
  const code = "code" in value ? value.code : undefined;
  const statusCode = "statusCode" in value ? value.statusCode : undefined;

  return (
    typeof error === "string" &&
    (code === undefined || typeof code === "number") &&
    (statusCode === undefined || typeof statusCode === "number")
  );
};
