export type GetSaleByUserDateQuery = { userId: string; date: Date | string };

export type GetSalesByRangeQuery = {
  userId: string;
  startDate: Date | string;
  endDate: Date | string;
};

export type CreateSaleBody = {
  userId: string;
  amount: number;
  date?: Date | string;
};

export type DeleteSaleBody = {
  userId: string;
};

export type SaleIdParams = {
  id: string;
};
