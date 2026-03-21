import { t } from "elysia";

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

export const saleSchema = {
  saleIdParams: t.Object({
    id: t.String(),
  }),
  getSaleByUserDateQuery: t.Object({
    userId: t.String(),
    date: t.String(),
  }),
  getSalesByRangeQuery: t.Object({
    userId: t.String(),
    startDate: t.String(),
    endDate: t.String(),
  }),
  createOrUpdateSaleBody: t.Object({
    userId: t.String(),
    amount: t.Number(),
    date: t.Optional(t.String()),
  }),
  deleteSaleBody: t.Object({
    userId: t.String(),
  }),
};
