export enum SaleErrorCode {
  SaleDayBucketNotFound = "SALE_DAY_BUCKET_NOT_FOUND",
  DeductionExceedsCurrentDailySales = "DEDUCTION_EXCEEDS_CURRENT_DAILY_SALES",
  InvalidNonNegativeAmount = "INVALID_NON_NEGATIVE_AMOUNT",
  InvalidPositiveAmount = "INVALID_POSITIVE_AMOUNT",
  DatabaseConnectionTimeout = "DATABASE_CONNECTION_TIMEOUT",
  FailedToCreateOrUpdateSale = "FAILED_TO_CREATE_OR_UPDATE_SALE",
  FailedToSetDailySaleAmount = "FAILED_TO_SET_DAILY_SALE_AMOUNT",
}

export class SaleServiceError extends Error {
  code: SaleErrorCode;

  constructor(code: SaleErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "SaleServiceError";
  }
}

export const asSaleServiceError = (error: unknown): SaleServiceError | null =>
  error instanceof SaleServiceError ? error : null;
