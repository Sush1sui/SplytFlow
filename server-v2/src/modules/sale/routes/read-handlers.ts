import {
  getSaleToday,
  getSalesByTimeRange,
  getTotalSalesByTimeRange,
} from "../service";
import {
  GetSalesQuery,
  GetTotalSalesQuery,
  ParamsQueryRouteContext,
  SaleRouteParams,
} from "../model";
import { parseUtcOffsetMinutes, toErrorMessage } from "./route-helpers";

export async function handleGetSales({
  params,
  query,
  set,
}: ParamsQueryRouteContext) {
  try {
    const { id } = params as SaleRouteParams;
    const { startDate, endDate, utcOffsetMinutes } = query as GetSalesQuery;
    const parsedOffset = parseUtcOffsetMinutes(utcOffsetMinutes);

    if (!id) {
      set.status = 400;
      return { error: "userId is required" };
    }

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
    }

    const result = await getSaleToday(id, parsedOffset);
    if (result.sales.length === 0) {
      set.status = 404;
      return { error: "No sales found for this user today" };
    }

    set.status = 200;
    return result;
  } catch (error) {
    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}

export async function handleGetTotalSales({
  params,
  query,
  set,
}: ParamsQueryRouteContext) {
  try {
    const { id } = params as SaleRouteParams;
    const { startDate, endDate } = query as GetTotalSalesQuery;

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
    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}
