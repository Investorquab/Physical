import type { z } from "zod";
import { ApiError } from "@physical/shared-types";
import { API_BASE_URL } from "./config";

export class ApiRequestError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiRequestError";
  }
}

export async function apiFetch<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiRequestError("INVALID_RESPONSE", "The server returned an unreadable response.");
  }

  if (!res.ok) {
    const parsedError = ApiError.safeParse(json);
    if (parsedError.success) {
      throw new ApiRequestError(parsedError.data.error.code, parsedError.data.error.message);
    }
    throw new ApiRequestError("UNKNOWN", `Request to ${path} failed with status ${res.status}.`);
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiRequestError(
      "SCHEMA_MISMATCH",
      `Response from ${path} didn't match the expected shape.`
    );
  }

  return parsed.data;
}
