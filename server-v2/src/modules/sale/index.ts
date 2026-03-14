import Elysia from "elysia";
import {
  createOrUpdate,
  deductFromDailySale,
  deleteSaleById,
  deleteSalesById,
  getSalesByTimeRange,
  getSaleToday,
  getTotalSalesByTimeRange,
} from "./service";
import { AdjustSaleBody, CreateOrUpdateBody, DeleteBody } from "./model";

const ADJUSTMENT_IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;
type AdjustResult = Awaited<ReturnType<typeof deductFromDailySale>>;

const completedAdjustments = new Map<
  string,
  { result: AdjustResult; expiresAt: number }
>();
const inFlightAdjustments = new Map<string, Promise<AdjustResult>>();

function trimRequestId(value: string | undefined) {
  return (value || "").trim();
}

function getAdjustmentIdempotencyKey(userId: string, requestId: string) {
  return `${userId}:${requestId}`;
}

function getCachedAdjustmentResult(key: string) {
  const cached = completedAdjustments.get(key);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    completedAdjustments.delete(key);
    return null;
  }

  return cached.result;
}

function cacheAdjustmentResult(key: string, result: AdjustResult) {
  completedAdjustments.set(key, {
    result,
    expiresAt: Date.now() + ADJUSTMENT_IDEMPOTENCY_TTL_MS,
  });
}

const sales = new Elysia({ prefix: "/sales" })
  /**
   * GET /sales/:id
   * Query params (optional): startDate, endDate.
   * If the date range is provided the call returns every sale in that
   * interval; otherwise the current‑day total is returned.
   */
  .get("/:id", async ({ params, query, set }) => {
    try {
      const { id } = params;
      const { startDate, endDate } = query;
      const parsedOffset =
        typeof query.utcOffsetMinutes === "string"
          ? Number(query.utcOffsetMinutes)
          : typeof query.utcOffsetMinutes === "number"
            ? query.utcOffsetMinutes
            : undefined;

      if (!id) {
        set.status = 400;
        return { error: "userId is required" };
      }

      // branch on presence of range parameters
      if (startDate && endDate) {
        const result = await getSalesByTimeRange(
          id,
          new Date(startDate),
          new Date(endDate),
        );

        if (result.sales.length === 0) {
          set.status = 404;
          return {
            error: "No sales found for this user in the specified time range",
          };
        }

        set.status = 200;
        return result;
      } else {
        const result = await getSaleToday(id, parsedOffset);
        if (result.sales.length === 0) {
          set.status = 404;
          return { error: "No sales found for this user today" };
        }

        set.status = 200;
        return result;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  })

  /**
   * GET /sales/:id/total?startDate=2024-01-01&endDate=2024-01-31
   * Response: 200 { totalSales: number } | 400 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId, startDate, or endDate
   * - 500: Error fetching total sales
   */
  .get("/:id/total", async ({ params, query, set }) => {
    try {
      const { id } = params;
      const { startDate, endDate } = query;

      if (!id) {
        set.status = 400;
        return { error: "userId is required" };
      }
      if (!startDate || !endDate) {
        set.status = 400;
        return { error: "startDate and endDate are required" };
      }

      const totalSales = await getTotalSalesByTimeRange(
        id,
        new Date(startDate),
        new Date(endDate),
      );

      set.status = 200;
      return { totalSales };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  })

  /**
   * POST /sales
   * Body: { userId, amount }
   * Response: 201 { sale: Sale } | 400 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId or amount
   * - 500: Error creating or updating sale
   */
  .post("/", async ({ body, set }) => {
    try {
      const { userId, amount, timeZone, utcOffsetMinutes, recordedAt } =
        body as CreateOrUpdateBody;

      const parsedAmount = Number(amount);
      const parsedOffset =
        typeof utcOffsetMinutes === "string"
          ? Number(utcOffsetMinutes)
          : typeof utcOffsetMinutes === "number"
            ? utcOffsetMinutes
            : undefined;
      const parsedRecordedAt = recordedAt ? new Date(recordedAt) : undefined;

      if (!userId || amount === undefined) {
        set.status = 400;
        return { error: "userId and amount are required" };
      }

      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        set.status = 400;
        return { error: "amount must be a positive number" };
      }

      if (parsedRecordedAt && Number.isNaN(parsedRecordedAt.getTime())) {
        set.status = 400;
        return { error: "recordedAt must be a valid ISO date string" };
      }

      const newSale = await createOrUpdate(userId, parsedAmount, {
        timeZone,
        utcOffsetMinutes: parsedOffset,
        recordedAt: parsedRecordedAt,
      });
      if (!newSale) {
        set.status = 500;
        return { error: "Failed to create or update sale" };
      }

      set.status = 201;
      return newSale;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  })
  .patch("/adjust", async ({ body, set }) => {
    let ownedInFlightKey: string | null = null;

    try {
      const { userId, amount, requestId, timeZone, utcOffsetMinutes, recordedAt } =
        body as AdjustSaleBody;

      const parsedAmount = Number(amount);
      const parsedOffset =
        typeof utcOffsetMinutes === "string"
          ? Number(utcOffsetMinutes)
          : typeof utcOffsetMinutes === "number"
            ? utcOffsetMinutes
            : undefined;
      const parsedRecordedAt = recordedAt ? new Date(recordedAt) : undefined;

      if (!userId || amount === undefined) {
        set.status = 400;
        return { error: "userId and amount are required" };
      }

      const normalizedRequestId = trimRequestId(requestId);
      if (!normalizedRequestId) {
        set.status = 400;
        return { error: "requestId is required" };
      }

      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        set.status = 400;
        return { error: "amount must be a positive number" };
      }

      if (parsedRecordedAt && Number.isNaN(parsedRecordedAt.getTime())) {
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

      const existingInFlight = inFlightAdjustments.get(idempotencyKey);
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
      inFlightAdjustments.set(idempotencyKey, requestPromise);
      ownedInFlightKey = idempotencyKey;

      const result = await requestPromise;
      cacheAdjustmentResult(idempotencyKey, result);

      set.status = 200;
      return { ...result, idempotentReplay: false };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";

      if (message === "Sale day bucket not found") {
        set.status = 404;
        return { error: message };
      }

      if (message === "Deduction exceeds current daily sales") {
        set.status = 400;
        return { error: message };
      }

      set.status = 500;
      return { error: message };
    } finally {
      if (ownedInFlightKey) {
        inFlightAdjustments.delete(ownedInFlightKey);
      }
    }
  })
  .delete("/:id", async ({ params, body, set }) => {
    try {
      const { id } = params;
      const { salesIds, date } = body as DeleteBody;

      if (!id) {
        set.status = 400;
        return { error: "userId is required" };
      }

      if (salesIds && Array.isArray(salesIds)) {
        const deletedSales = await deleteSalesById(id, salesIds);
        if (!deletedSales || deletedSales.length === 0) {
          set.status = 404;
          return { error: "No sales found to delete for this user" };
        }
        set.status = 200;
        return deletedSales;
      }

      if (!date) {
        set.status = 400;
        return { error: "date is required" };
      }
      const deletedSale = await deleteSaleById(id, new Date(date));
      if (!deletedSale) {
        set.status = 404;
        return {
          error: "No sale found to delete for this user on the specified date",
        };
      }

      set.status = 200;
      return deletedSale;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  });

export default sales;
