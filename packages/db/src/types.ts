import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users, splitConfigs, earnings, splitAllocations } from "./schema";

// ============================================
// SELECT TYPES (from database)
// ============================================
export type User = InferSelectModel<typeof users>;
export type SplitConfig = InferSelectModel<typeof splitConfigs>;
export type Earning = InferSelectModel<typeof earnings>;
export type SplitAllocation = InferSelectModel<typeof splitAllocations>;

// ============================================
// INSERT TYPES (for creating records)
// ============================================
export type NewUser = InferInsertModel<typeof users>;
export type NewSplitConfig = InferInsertModel<typeof splitConfigs>;
export type NewEarning = InferInsertModel<typeof earnings>;
export type NewSplitAllocation = InferInsertModel<typeof splitAllocations>;

// ============================================
// EXTENDED TYPES (with relations)
// ============================================
export type EarningWithAllocations = Earning & {
  allocations: (SplitAllocation & {
    splitConfig: SplitConfig;
  })[];
};

export type SplitConfigWithAllocations = SplitConfig & {
  allocations: SplitAllocation[];
};

// ============================================
// DTO TYPES (for API requests/responses)
// ============================================
export type CreateEarningDTO = {
  amount: number;
  date: string; // ISO date string
  description?: string;
};

export type UpdateEarningDTO = Partial<CreateEarningDTO>;

export type CreateSplitConfigDTO = {
  name: string;
  percentage: number;
  color?: string;
  sortOrder?: number;
};

export type UpdateSplitConfigDTO = Partial<CreateSplitConfigDTO> & {
  isActive?: boolean;
};

// ============================================
// ANALYTICS TYPES
// ============================================
export type EarningsSummary = {
  totalEarnings: number;
  totalAfterSplits: number;
  splitBreakdown: {
    splitConfigId: number;
    splitConfigName: string;
    totalAmount: number;
    percentage: number;
    color?: string;
  }[];
};

export type PeriodStats = {
  period: "today" | "week" | "month" | "year";
  totalEarnings: number;
  earningsCount: number;
  averageEarning: number;
  comparisonToPrevious: {
    percentageChange: number;
    amountChange: number;
  };
};

export type EarningsChartData = {
  date: string;
  amount: number;
  label: string; // Formatted date for display
}[];
