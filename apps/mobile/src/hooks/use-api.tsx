import { useState, useEffect, useCallback } from "react";
import { earningsApi, splitConfigsApi } from "@/src/lib/api-client";
import type {
  EarningWithAllocations,
  EarningsSummary,
  SplitConfig,
  CreateEarningDTO,
  UpdateEarningDTO,
} from "@splytflow/types";

// ============================================
// EARNINGS HOOKS
// ============================================

/**
 * Hook to fetch earnings list
 */
export function useEarnings(params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  const [data, setData] = useState<EarningWithAllocations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const earnings = await earningsApi.list(params);
      setData(earnings);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [params?.startDate, params?.endDate, params?.limit, params?.offset]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  return { data, loading, error, refetch: fetchEarnings };
}

/**
 * Hook to fetch earnings summary
 */
export function useEarningsSummary(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const [data, setData] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await earningsApi.summary(params);
      setData(summary);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [params?.startDate, params?.endDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, error, refetch: fetchSummary };
}

/**
 * Hook for earnings mutations (create, update, delete)
 */
export function useEarningsMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createEarning = async (data: CreateEarningDTO) => {
    try {
      setLoading(true);
      setError(null);
      const result = await earningsApi.create(data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEarning = async (id: number, data: UpdateEarningDTO) => {
    try {
      setLoading(true);
      setError(null);
      const result = await earningsApi.update(id, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEarning = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await earningsApi.delete(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createEarning,
    updateEarning,
    deleteEarning,
    loading,
    error,
  };
}

// ============================================
// SPLIT CONFIGS HOOKS
// ============================================

/**
 * Hook to fetch split configurations
 */
export function useSplitConfigs(includeInactive = false) {
  const [data, setData] = useState<SplitConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const configs = await splitConfigsApi.list(includeInactive);
      setData(configs);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return { data, loading, error, refetch: fetchConfigs };
}

/**
 * Hook for split config mutations
 */
export function useSplitConfigsMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createConfig = async (data: {
    name: string;
    percentage: number;
    color?: string;
    sortOrder?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await splitConfigsApi.create(data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (
    id: number,
    data: {
      name?: string;
      percentage?: number;
      color?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await splitConfigsApi.update(id, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteConfig = async (id: number, hard = false) => {
    try {
      setLoading(true);
      setError(null);
      await splitConfigsApi.delete(id, hard);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderConfigs = async (order: number[]) => {
    try {
      setLoading(true);
      setError(null);
      await splitConfigsApi.reorder(order);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createConfig,
    updateConfig,
    deleteConfig,
    reorderConfigs,
    loading,
    error,
  };
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook to get today's date range
 */
export function useTodayDateRange() {
  const today = new Date();
  const startDate = today.toISOString().split("T")[0];
  const endDate = startDate;

  return { startDate, endDate };
}

/**
 * Hook to format currency
 */
export function useFormatCurrency() {
  return useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }, []);
}
