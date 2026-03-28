export type SalesRangePreset =
  | "today"
  | "1d"
  | "2d"
  | "1w"
  | "1m"
  | "3m"
  | "1y"
  | "7d"
  | "prev7d"
  | "30d"
  | "prev30d"
  | "90d"
  | "prev90d"
  | "365d"
  | "prev365d";

export type SalesRangeQuery = {
  startLocalDate: string;
  endLocalDate: string;
  timeZone: string;
};

export type SaleRow = {
  id: string;
  userId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

export type SalesTotals = {
  today: number;
  oneDayAgo: number;
  twoDaysAgo: number;
  oneWeekAgo: number;
  oneMonthAgo: number;
  threeMonthsAgo: number;
  oneYearAgo: number;
  last7Days: number;
  prior7Days: number;
  last30Days: number;
  prior30Days: number;
  last90Days: number;
  prior90Days: number;
  last365Days: number;
  prior365Days: number;
};

export type SaleState = {
  sales: SalesTotals;
  history: SaleRow[];
  historyStatus: "idle" | "loading" | "succeeded" | "failed";
  historyError: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFetched: number | null;
  rangeStatus: Record<SalesRangePreset, "idle" | "loading" | "succeeded" | "failed">;
};


export type RecentLogType = {
  id: string;
  userId: string;
  amount: number;
  actionType: "create" | "update" | "delete";
  createdAt: string;
  updatedAt?: string;
};

export type AddSalePayload = {
  userId: string;
  amount: number;
  localDate?: string;
  localTime?: string;
};

export type UpdateSalePayload = {
  id: string;
  userId: string;
  amount: number;
};

export type DeleteSalePayload = {
  id: string;
  userId: string;
  amount?: number;
};

export type DeleteSaleResponse = {
  message: string;
};
