import {
  createOrUpdate,
  deleteSaleById,
  deleteSalesById,
  setDailySaleAmount,
} from "../service";
import {
  BodyRouteContext,
  CreateOrUpdateBody,
  DeleteBody,
  ParamsBodyRouteContext,
  SaleRouteParams,
  SetDayBody,
} from "../model";
import {
  parseRecordedAt,
  parseUtcOffsetMinutes,
  toErrorMessage,
} from "./route-helpers";

export async function handleCreateSale({ body, set }: BodyRouteContext) {
  try {
    const { userId, amount, timeZone, utcOffsetMinutes, recordedAt } =
      body as CreateOrUpdateBody;

    const parsedAmount = Number(amount);
    const parsedOffset = parseUtcOffsetMinutes(utcOffsetMinutes);
    const parsedRecordedAt = parseRecordedAt(recordedAt);

    if (!userId || amount === undefined) {
      set.status = 400;
      return { error: "userId and amount are required" };
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      set.status = 400;
      return { error: "amount must be a positive number" };
    }

    if (parsedRecordedAt === null) {
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
    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}

export async function handleSetDaySale({ body, set }: BodyRouteContext) {
  try {
    const { userId, amount, timeZone, utcOffsetMinutes, recordedAt } =
      body as SetDayBody;

    const parsedAmount = Number(amount);
    const parsedOffset = parseUtcOffsetMinutes(utcOffsetMinutes);
    const parsedRecordedAt = parseRecordedAt(recordedAt);

    if (!userId || amount === undefined) {
      set.status = 400;
      return { error: "userId and amount are required" };
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      set.status = 400;
      return { error: "amount must be a non-negative number" };
    }

    if (parsedRecordedAt === null) {
      set.status = 400;
      return { error: "recordedAt must be a valid ISO date string" };
    }

    const result = await setDailySaleAmount(userId, parsedAmount, {
      timeZone,
      utcOffsetMinutes: parsedOffset,
      recordedAt: parsedRecordedAt,
    });

    set.status = 200;
    return result;
  } catch (error) {
    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}

export async function handleDeleteSale({
  params,
  body,
  set,
}: ParamsBodyRouteContext) {
  try {
    const { id } = params as SaleRouteParams;
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
    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}
