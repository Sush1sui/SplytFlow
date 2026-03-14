export type CreateOrUpdateBody = {
  userId: string;
  amount: number;
  // Optional timezone context from mobile for day-bucket aggregation.
  timeZone?: string;
  // Minutes offset from UTC (e.g. UTC+8 => 480, UTC-5 => -300).
  utcOffsetMinutes?: number | string;
  // Optional event timestamp from client (ISO string). Defaults to now.
  recordedAt?: string;
};

export type AdjustSaleBody = {
  userId: string;
  // Positive amount to deduct from the computed local-day bucket.
  amount: number;
  // Client-provided idempotency key to prevent duplicate deductions.
  requestId: string;
  timeZone?: string;
  utcOffsetMinutes?: number | string;
  recordedAt?: string;
};

export type SetDayBody = {
  userId: string;
  // Exact amount to store for the computed local-day bucket.
  // Use 0 to delete the day's bucket.
  amount: number;
  timeZone?: string;
  utcOffsetMinutes?: number | string;
  recordedAt?: string;
};

export type DeleteBody = { salesIds?: string[]; date?: Date | string };

export type RouteSet = {
  status?: number | string;
};

export type BodyRouteContext = {
  body: unknown;
  set: RouteSet;
};

export type ParamsQueryRouteContext = {
  params: Record<string, string>;
  query: Record<string, string | undefined>;
  set: RouteSet;
};

export type ParamsBodyRouteContext = {
  params: Record<string, string>;
  body: unknown;
  set: RouteSet;
};

export type SaleRouteParams = {
  id?: string;
};

export type GetSalesQuery = {
  startDate?: string;
  endDate?: string;
  utcOffsetMinutes?: string | number;
};

export type GetTotalSalesQuery = {
  startDate?: string;
  endDate?: string;
};

export type CreateOrUpdateOptions = {
  timeZone?: string;
  utcOffsetMinutes?: number;
  recordedAt?: Date;
};
