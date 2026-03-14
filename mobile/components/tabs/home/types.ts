export type TodaySale = {
  id: string;
  amount: number;
  createdAt: string;
};

export type RecentSaleLog = {
  id: string;
  amount: number;
  createdAt: string;
  timeZone?: string;
  utcOffsetMinutes?: number;
};

export type TodaySalesResponse = {
  sales: TodaySale[];
  net_sale: number;
};

export type CreateSaleResponse = {
  id: string;
  userId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdjustSaleResponse = {
  sale: {
    id: string;
    userId: string;
    amount: number;
    createdAt: string;
    updatedAt: string;
  } | null;
  deleted: boolean;
  idempotentReplay?: boolean;
};
