import { API_ENDPOINTS } from "@/constants/api";
import { authenticatedFetch } from "@/lib/utils/auth-fetch";

import type { SplitRule } from "./types";

export async function fetchSplitRules(userId: string): Promise<SplitRule[]> {
  const response = await authenticatedFetch<SplitRule[]>(
    API_ENDPOINTS.SPLIT.BY_USER(userId),
    { method: "GET" },
  );

  return Array.isArray(response) ? response : [];
}

export async function upsertSplitRule(
  userId: string,
  name: string,
  value: number,
) {
  return authenticatedFetch<SplitRule>(API_ENDPOINTS.SPLIT.UPSERT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, name, value }),
  });
}

export async function deleteSplitRule(userId: string, name: string) {
  return authenticatedFetch(API_ENDPOINTS.SPLIT.DELETE, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, name }),
  });
}

export async function deleteAllSplitRules(userId: string) {
  return authenticatedFetch(API_ENDPOINTS.SPLIT.DELETE_ALL_BY_USER(userId), {
    method: "DELETE",
  });
}
