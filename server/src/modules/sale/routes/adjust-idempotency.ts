import { deductFromDailySale } from "../service";

const ADJUSTMENT_IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;

type AdjustResult = Awaited<ReturnType<typeof deductFromDailySale>>;

const completedAdjustments = new Map<
  string,
  { result: AdjustResult; expiresAt: number }
>();
const inFlightAdjustments = new Map<string, Promise<AdjustResult>>();

export function normalizeRequestId(value: string | undefined) {
  return (value || "").trim();
}

export function getAdjustmentIdempotencyKey(userId: string, requestId: string) {
  return `${userId}:${requestId}`;
}

export function getCachedAdjustmentResult(key: string) {
  const cached = completedAdjustments.get(key);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    completedAdjustments.delete(key);
    return null;
  }

  return cached.result;
}

export function cacheAdjustmentResult(key: string, result: AdjustResult) {
  completedAdjustments.set(key, {
    result,
    expiresAt: Date.now() + ADJUSTMENT_IDEMPOTENCY_TTL_MS,
  });
}

export function getInFlightAdjustment(key: string) {
  return inFlightAdjustments.get(key) ?? null;
}

export function setInFlightAdjustment(
  key: string,
  request: Promise<AdjustResult>,
) {
  inFlightAdjustments.set(key, request);
}

export function clearInFlightAdjustment(key: string) {
  inFlightAdjustments.delete(key);
}
