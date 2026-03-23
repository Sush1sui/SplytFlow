export type SalesRangePreset = "today" | "1d" | "1w" | "1m" | "3m" | "1y";

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
  oneWeekAgo: number;
  oneMonthAgo: number;
  threeMonthsAgo: number;
  oneYearAgo: number;
};

export type SaleState = {
  sales: SalesTotals;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export type AddSalePayload = {
  userId: string;
  amount: number;
};

export type UpdateSalePayload = {
  id: string;
  userId: string;
  amount: number;
};

export type DeleteSalePayload = {
  id: string;
  userId: string;
};

export type DeleteSaleResponse = {
  message: string;
};
