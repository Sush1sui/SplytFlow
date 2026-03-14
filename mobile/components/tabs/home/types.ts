export type TodaySale = {
  id: string;
  amount: number;
  createdAt: string;
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
