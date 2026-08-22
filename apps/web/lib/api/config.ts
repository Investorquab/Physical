export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const API_BASE_URL = USE_MOCK
  ? "/api/mock"
  : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "");
