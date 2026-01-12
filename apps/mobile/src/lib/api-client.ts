import { hc } from "hono/client";
import type {
  CreateEarningDTO,
  UpdateEarningDTO,
  CreateSplitConfigDTO,
  UpdateSplitConfigDTO,
  EarningWithAllocations,
  EarningsSummary,
  SplitConfig,
} from "@splytflow/types";
import { ApiClient } from "./types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

if (!BASE_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_URL environment variable");
}

const client = hc(BASE_URL);
export const apiClient = client as unknown as ApiClient;

// Helper to get userId from context - will be set by auth
let currentUserId: number | null = null;

export const setUserId = (userId: number) => {
  currentUserId = userId;
};

export const getUserId = () => {
  if (!currentUserId) {
    throw new Error("User ID not set. Make sure user is authenticated.");
  }
  return currentUserId;
};

// ============================================
// EARNINGS API
// ============================================

export const earningsApi = {
  /**
   * Create a new earning entry
   */
  async create(data: CreateEarningDTO): Promise<EarningWithAllocations> {
    const res = await apiClient.earnings.$post(
      {
        json: data,
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to create earning");
    }

    const result = await res.json();
    return result.data;
  },

  /**
   * Get earnings with optional filtering
   */
  async list(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<EarningWithAllocations[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const res = await apiClient.earnings.$get(
      {
        query: Object.fromEntries(queryParams),
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch earnings");
    }

    const result = await res.json();
    return result.data;
  },

  /**
   * Get earnings summary for a date range
   */
  async summary(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<EarningsSummary> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const res = await apiClient.earnings.summary.$get(
      {
        query: Object.fromEntries(queryParams),
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch earnings summary");
    }

    const result = await res.json();
    return result.data;
  },

  /**
   * Get a single earning by ID
   */
  async get(id: number): Promise<EarningWithAllocations> {
    const res = await apiClient.earnings[":id"].$get(
      {
        param: { id: id.toString() },
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch earning");
    }

    const result = await res.json();
    return result.data;
  },

  /**
   * Update an earning
   */
  async update(
    id: number,
    data: UpdateEarningDTO
  ): Promise<EarningWithAllocations> {
    const res = await apiClient.earnings[":id"].$patch(
      {
        param: { id: id.toString() },
        json: data,
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update earning");
    }

    const result = await res.json();
    return result.data;
  },

  /**
   * Delete an earning
   */
  async delete(id: number): Promise<void> {
    const res = await apiClient.earnings[":id"].$delete(
      {
        param: { id: id.toString() },
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to delete earning");
    }
  },
};

// ============================================
// SPLIT CONFIGS API
// ============================================

export const splitConfigsApi = {
  /**
   * Create a new split configuration
   */
  async create(data: CreateSplitConfigDTO): Promise<SplitConfig> {
    const res = await apiClient["split-configs"].$post(
      {
        json: data,
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create split config");
    }

    const result = await res.json();
    return result.data;
  },

  /**
   * Get all split configurations
   */
  async list(includeInactive = false): Promise<SplitConfig[]> {
    const queryParams = new URLSearchParams();
    if (includeInactive) queryParams.append("includeInactive", "true");

    const res = await apiClient["split-configs"].$get(
      {
        query: Object.fromEntries(queryParams),
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch split configs");
    }

    const result = await res.json();
    return result.data;
  },

  /**
   * Get a single split configuration
   */
  async get(id: number): Promise<SplitConfig> {
    const res = await apiClient["split-configs"][":id"].$get(
      {
        param: { id: id.toString() },
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch split config");
    }

    const result = await res.json();
    return result.data;
  },

  /**
   * Update a split configuration
   */
  async update(id: number, data: UpdateSplitConfigDTO): Promise<SplitConfig> {
    const res = await apiClient["split-configs"][":id"].$patch(
      {
        param: { id: id.toString() },
        json: data,
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update split config");
    }

    const result = await res.json();
    return result.data;
  },

  /**
   * Delete a split configuration (soft delete by default)
   */
  async delete(id: number, hard = false): Promise<void> {
    const queryParams = new URLSearchParams();
    if (hard) queryParams.append("hard", "true");

    const res = await apiClient["split-configs"][":id"].$delete(
      {
        param: { id: id.toString() },
        query: Object.fromEntries(queryParams),
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to delete split config");
    }
  },

  /**
   * Reorder split configurations
   */
  async reorder(order: number[]): Promise<void> {
    const res = await apiClient["split-configs"].reorder.$post(
      {
        json: { order },
      },
      {
        headers: {
          "X-User-Id": getUserId().toString(),
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to reorder split configs");
    }
  },
};
