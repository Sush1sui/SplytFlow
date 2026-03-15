import { ApiError } from "@/lib/utils/api-fetcher";

export const MAX_TOTAL_SPLIT = 100;
export const CAP_EPSILON = 1e-6;

export const normalizeRuleName = (rawName: string) =>
  rawName.trim().replace(/\s+/g, " ");

export const formatPct = (value: number) =>
  `${value.toFixed(1).replace(/\.0$/, "")}%`;

export const parseApiMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    const body = error.body;
    if (body && typeof body === "object" && "error" in body) {
      const message = (body as { error?: unknown }).error;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }

    if (error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
