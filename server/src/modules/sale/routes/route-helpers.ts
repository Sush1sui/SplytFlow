import { asSaleServiceError, SaleErrorCode } from "../errors";

export function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unknown error occurred";
}

export function parseUtcOffsetMinutes(value: unknown) {
  if (typeof value === "string") return Number(value);
  if (typeof value === "number") return value;
  return undefined;
}

export function parseRecordedAt(value: unknown) {
  if (!value) return undefined;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function mapAdjustSaleErrorToStatus(error: unknown) {
  const known = asSaleServiceError(error);
  if (!known) return null;

  switch (known.code) {
    case SaleErrorCode.SaleDayBucketNotFound:
      return 404;
    case SaleErrorCode.DeductionExceedsCurrentDailySales:
      return 400;
    default:
      return null;
  }
}
