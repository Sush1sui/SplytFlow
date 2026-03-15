import { useCallback, useEffect, useState } from "react";

import { API_ENDPOINTS } from "@/constants/api";
import { authenticatedFetch } from "@/lib/utils/auth-fetch";
import { parseApiMessage } from "./split-rules-utils";
import type { SplitCorrectionHistoryEntry } from "./types";

type CorrectionHistoryResponse = {
  corrections?: SplitCorrectionHistoryEntry[];
};

export function useSplitCorrectionHistory(userId?: string) {
  const [entries, setEntries] = useState<SplitCorrectionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!userId) {
        setEntries([]);
        setError(null);
        setLoading(false);
        if (isRefresh) setRefreshing(false);
        return;
      }

      if (!isRefresh) setLoading(true);

      try {
        setError(null);
        const response = await authenticatedFetch<CorrectionHistoryResponse>(
          API_ENDPOINTS.SPLIT.CORRECTION_HISTORY_BY_USER(userId, 25),
          { method: "GET" },
        );

        const list = Array.isArray(response?.corrections)
          ? response.corrections
          : [];

        setEntries(list);
      } catch (error) {
        setEntries([]);
        setError(parseApiMessage(error, "Could not load correction history."));
      } finally {
        setLoading(false);
        if (isRefresh) setRefreshing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    void load(true);
  }, [load]);

  return {
    entries,
    loading,
    refreshing,
    error,
    refresh,
  };
}
