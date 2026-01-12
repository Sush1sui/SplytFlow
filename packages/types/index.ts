// ============================================
// USER TYPES
// ============================================
export type User = {
  id: number;
  supabaseId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

// ============================================
// SPLIT CONFIG TYPES
// ============================================
export type SplitConfig = {
  id: number;
  userId: number;
  name: string;
  percentage: string;
  color: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

// ============================================
// EARNING TYPES
// ============================================
export type Earning = {
  id: number;
  userId: number;
  amount: string;
  date: string;
  description: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

// ============================================
// SPLIT ALLOCATION TYPES
// ============================================
export type SplitAllocation = {
  id: number;
  earningId: number;
  splitConfigId: number;
  amount: string;
  percentage: string;
  createdAt: Date | string;
};

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

// ============================================
// API RESPONSE TYPES
// ============================================
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
