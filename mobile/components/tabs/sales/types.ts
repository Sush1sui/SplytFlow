export type SalesPreset = "1d" | "1w" | "1m" | "3m" | "1y" | "all";

export type SalesRange = {
  startDate: Date;
  endDate: Date;
  label: string;
};

export type SaleRow = {
  id: string;
  userId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

export type SalesRangeResponse = {
  sales: SaleRow[];
  net_sale: number;
  split_breakdown?: SplitBreakdownItem[];
  split_breakdown_timeline?: SplitBreakdownTimelineItem[];
};

export type SplitBreakdownItem = {
  name: string;
  value: number;
};

export type SplitBreakdownTimelineItem = {
  effectiveFrom: string | null;
  totalSplitPct: number;
  breakdown: SplitBreakdownItem[];
  salesCount?: number;
};

export type SplitItem = {
  id: string;
  userId: string;
  name: string;
  value: number;
  createdAt: string;
  updatedAt: string;
};

export type TrendPoint = {
  label: string;
  amount: number;
};
