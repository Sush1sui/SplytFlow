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

export type DeleteBody = { salesIds?: string[]; date?: Date };

export type CreateOrUpdateOptions = {
  timeZone?: string;
  utcOffsetMinutes?: number;
  recordedAt?: Date;
};
