import { AdjustSaleBody, BodyRouteContext } from "../model";
import { deductFromDailySale } from "../service";
import {
  cacheAdjustmentResult,
  clearInFlightAdjustment,
  getAdjustmentIdempotencyKey,
  getCachedAdjustmentResult,
  getInFlightAdjustment,
  normalizeRequestId,
  setInFlightAdjustment,
} from "./adjust-idempotency";
import {
  mapAdjustSaleErrorToStatus,
  parseRecordedAt,
  parseUtcOffsetMinutes,
  toErrorMessage,
} from "./route-helpers";

export async function handleAdjustSale({ body, set }: BodyRouteContext) {
  let ownedInFlightKey: string | null = null;

  try {
    const {
      userId,
      amount,
      requestId,
      timeZone,
      utcOffsetMinutes,
      recordedAt,
    } = body as AdjustSaleBody;

    const parsedAmount = Number(amount);
    const parsedOffset = parseUtcOffsetMinutes(utcOffsetMinutes);
    const parsedRecordedAt = parseRecordedAt(recordedAt);

    if (!userId || amount === undefined) {
      set.status = 400;
      return { error: "userId and amount are required" };
    }

    const normalizedRequestId = normalizeRequestId(requestId);
    if (!normalizedRequestId) {
      set.status = 400;
      return { error: "requestId is required" };
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      set.status = 400;
      return { error: "amount must be a positive number" };
    }

    if (parsedRecordedAt === null) {
      set.status = 400;
      return { error: "recordedAt must be a valid ISO date string" };
    }

    const idempotencyKey = getAdjustmentIdempotencyKey(
      userId,
      normalizedRequestId,
    );

    const cachedResult = getCachedAdjustmentResult(idempotencyKey);
    if (cachedResult) {
      set.status = 200;
      return { ...cachedResult, idempotentReplay: true };
    }

    const existingInFlight = getInFlightAdjustment(idempotencyKey);
    if (existingInFlight) {
      const replayed = await existingInFlight;
      set.status = 200;
      return { ...replayed, idempotentReplay: true };
    }

    const requestPromise = deductFromDailySale(userId, parsedAmount, {
      timeZone,
      utcOffsetMinutes: parsedOffset,
      recordedAt: parsedRecordedAt,
    });
    setInFlightAdjustment(idempotencyKey, requestPromise);
    ownedInFlightKey = idempotencyKey;

    const result = await requestPromise;
    cacheAdjustmentResult(idempotencyKey, result);

    set.status = 200;
    return { ...result, idempotentReplay: false };
  } catch (error) {
    const mappedStatus = mapAdjustSaleErrorToStatus(error);
    if (mappedStatus !== null) {
      set.status = mappedStatus;
      return { error: toErrorMessage(error) };
    }

    set.status = 500;
    return { error: toErrorMessage(error) };
  } finally {
    if (ownedInFlightKey) {
      clearInFlightAdjustment(ownedInFlightKey);
    }
  }
}
