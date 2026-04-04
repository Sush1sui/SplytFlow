import { t } from "elysia";

export type GetSalesQuery = {
  userId: string;
  currencyCode?: string;
};

export type GetSalesByRangeQuery = {
  userId: string;
  startLocalDate: string;
  endLocalDate: string;
  timeZone: string;
  currencyCode?: string;
};

export type CreateSaleBody = {
  userId: string;
  amount: number;
  originalAmount: number;
  currencyCode: string;
  timeZone: string;
  localDate?: string;
  localTime?: string;
};

export type UpdateSaleBody = {
  userId: string;
  amount: number;
  originalAmount: number;
  currencyCode: string;
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
    currencyCode: t.Optional(t.String()),
  }),
  getSalesByRangeQuery: t.Object({
    userId: t.String(),
    startLocalDate: t.String(),
    endLocalDate: t.String(),
    timeZone: t.String(),
    currencyCode: t.Optional(t.String()),
  }),
  createSaleBody: t.Object({
    userId: t.String(),
    amount: t.Number(),
    originalAmount: t.Number(),
    currencyCode: t.String(),
    timeZone: t.String(),
    localDate: t.Optional(t.String()),
    localTime: t.Optional(t.String()),
  }),
  updateSaleBody: t.Object({
    userId: t.String(),
    amount: t.Number(),
    originalAmount: t.Number(),
    currencyCode: t.String(),
  }),
  deleteSaleBody: t.Object({
    userId: t.String(),
  }),
};
