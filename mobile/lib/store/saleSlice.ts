import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ApiError, apiFetcher } from "../api";
import {
  addRecentLog,
  getLocalTimeZone,
  getSalesRangeQueryByPreset,
  sumSaleRows,
} from "../utils/sale";
import {
  AddSalePayload,
  DeleteSalePayload,
  DeleteSaleResponse,
  RecentLogType,
  SaleRow,
  SalesRangePreset,
  SaleState,
  SalesTotals,
  UpdateSalePayload,
} from "@/types/sale.types";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";

const RANGE_PRESETS: SalesRangePreset[] = [
  "today",
  "1d",
  "2d",
  "1w",
  "1m",
  "3m",
  "1y",
  "7d",
  "prev7d",
  "30d",
  "prev30d",
  "90d",
  "prev90d",
  "365d",
  "prev365d",
];

const PRESET_TO_KEY: Record<SalesRangePreset, keyof SalesTotals> = {
  today: "today",
  "1d": "oneDayAgo",
  "2d": "twoDaysAgo",
  "1w": "oneWeekAgo",
  "1m": "oneMonthAgo",
  "3m": "threeMonthsAgo",
  "1y": "oneYearAgo",
  "7d": "last7Days",
  prev7d: "prior7Days",
  "30d": "last30Days",
  prev30d: "prior30Days",
  "90d": "last90Days",
  prev90d: "prior90Days",
  "365d": "last365Days",
  prev365d: "prior365Days",
};

function upsertHistoryRow(history: SaleRow[], row: SaleRow): SaleRow[] {
  const index = history.findIndex((item) => item.id === row.id);
  if (index === -1) return [row, ...history];

  const next = [...history];
  next[index] = row;
  return next;
}

export const fetchSales = createAsyncThunk(
  "sales/fetchSales",
  async (userId: string) => {
    const totals: SalesTotals = {
      today: 0,
      oneDayAgo: 0,
      twoDaysAgo: 0,
      oneWeekAgo: 0,
      oneMonthAgo: 0,
      threeMonthsAgo: 0,
      oneYearAgo: 0,
      last7Days: 0,
      prior7Days: 0,
      last30Days: 0,
      prior30Days: 0,
      last90Days: 0,
      prior90Days: 0,
      last365Days: 0,
      prior365Days: 0,
    };
    const results = await Promise.all(
      RANGE_PRESETS.map(async (preset) => {
        const { startLocalDate, endLocalDate, timeZone } =
          getSalesRangeQueryByPreset(preset);
        const query = new URLSearchParams({
          userId,
          startLocalDate,
          endLocalDate,
          timeZone,
        });
        try {
          const rows = await apiFetcher<SaleRow[]>(
            `${API_BASE_URL}${API_ENDPOINTS.SALE.RANGE}?${query.toString()}`,
          );
          return { preset, total: sumSaleRows(rows) };
        } catch (error) {
          // No rows in a date bucket should behave as zero, not as a failure.
          if (error instanceof ApiError && error.status === 404)
            return { preset, total: 0 };
          throw error;
        }
      }),
    );

    for (const result of results) {
      totals[PRESET_TO_KEY[result.preset]] = result.total;
    }

    return totals;
  },
);

export const fetchSalesHistory = createAsyncThunk(
  "sales/fetchSalesHistory",
  async (userId: string) => {
    const query = new URLSearchParams({ userId });
    try {
      const rows = await apiFetcher<SaleRow[]>(
        `${API_BASE_URL}${API_ENDPOINTS.SALE.LIST}?${query.toString()}`,
      );

      return rows.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [] as SaleRow[];
      }
      throw error;
    }
  },
);

export const addSale = createAsyncThunk(
  "sales/addSale",
  async ({ userId, amount, localDate, localTime }: AddSalePayload) => {
    const timeZone = getLocalTimeZone();

    const result = await apiFetcher<SaleRow>(
      `${API_BASE_URL}${API_ENDPOINTS.SALE.CREATE}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount,
          timeZone,
          localDate,
          localTime,
        }),
      },
    );

    // Local log persistence should never block a successful sale write.
    const recentLog: RecentLogType = {
      id: result.id,
      userId: result.userId,
      amount: result.amount,
      actionType: "create",
      createdAt: new Date().toISOString(),
    };
    try {
      await addRecentLog(recentLog);
    } catch {
      // Non-critical side effect; sale creation has already succeeded.
    }
    return result;
  },
);

export const updateSale = createAsyncThunk(
  "sales/updateSale",
  async ({ id, userId, amount }: UpdateSalePayload) => {
    const result = await apiFetcher<SaleRow>(
      `${API_BASE_URL}${API_ENDPOINTS.SALE.BY_ID(id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount,
        }),
      },
    );

    const recentLog: RecentLogType = {
      id: result.id,
      userId: result.userId,
      amount: result.amount,
      actionType: "update",
      createdAt: new Date().toISOString(),
      updatedAt: result.updatedAt,
    };

    try {
      await addRecentLog(recentLog);
    } catch {
      // Non-critical side effect; sale update has already succeeded.
    }

    return result;
  },
);

export const deleteSale = createAsyncThunk(
  "sales/deleteSale",
  async ({ id, userId, amount }: DeleteSalePayload) => {
    const result = await apiFetcher<DeleteSaleResponse>(
      `${API_BASE_URL}${API_ENDPOINTS.SALE.BY_ID(id)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      },
    );

    const recentLog: RecentLogType = {
      id,
      userId,
      amount: amount ?? 0,
      actionType: "delete",
      createdAt: new Date().toISOString(),
    };

    try {
      await addRecentLog(recentLog);
    } catch {
      // Non-critical side effect; sale deletion has already succeeded.
    }

    return { id, message: result.message };
  },
);

const initialState: SaleState = {
  sales: {
    today: 0,
    oneDayAgo: 0,
    twoDaysAgo: 0,
    oneWeekAgo: 0,
    oneMonthAgo: 0,
    threeMonthsAgo: 0,
    oneYearAgo: 0,
    last7Days: 0,
    prior7Days: 0,
    last30Days: 0,
    prior30Days: 0,
    last90Days: 0,
    prior90Days: 0,
    last365Days: 0,
    prior365Days: 0,
  },
  history: [],
  historyStatus: "idle",
  historyError: null,
  status: "idle",
  error: null,
};

const saleSlice = createSlice({
  name: "sale",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sales = action.payload;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch sales";
      })
      .addCase(fetchSalesHistory.pending, (state) => {
        state.historyStatus = "loading";
        state.historyError = null;
      })
      .addCase(fetchSalesHistory.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.history = action.payload;
      })
      .addCase(fetchSalesHistory.rejected, (state, action) => {
        state.historyStatus = "failed";
        state.historyError =
          action.error.message ?? "Failed to fetch sales history";
      })
      .addCase(addSale.fulfilled, (state, action) => {
        state.history = upsertHistoryRow(state.history, action.payload).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.history = upsertHistoryRow(state.history, action.payload).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.history = state.history.filter(
          (item) => item.id !== action.payload.id,
        );
      });
  },
});

export default saleSlice.reducer;
