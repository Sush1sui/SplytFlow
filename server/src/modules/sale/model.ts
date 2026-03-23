import { t } from "elysia";

export type GetSalesQuery = {
  userId: string;
};

export type GetSalesByRangeQuery = {
  userId: string;
  startLocalDate: string;
  endLocalDate: string;
  timeZone: string;
};

export type CreateSaleBody = {
  userId: string;
  amount: number;
  timeZone: string;
};

export type UpdateSaleBody = {
  userId: string;
  amount: number;
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
  getSalesQuery: t.Object({
    userId: t.String(),
  }),
  getSalesByRangeQuery: t.Object({
    userId: t.String(),
    startLocalDate: t.String(),
    endLocalDate: t.String(),
    timeZone: t.String(),
  }),
  createSaleBody: t.Object({
    userId: t.String(),
    amount: t.Number(),
    timeZone: t.String(),
  }),
  updateSaleBody: t.Object({
    userId: t.String(),
    amount: t.Number(),
  }),
  deleteSaleBody: t.Object({
    userId: t.String(),
  }),
};
