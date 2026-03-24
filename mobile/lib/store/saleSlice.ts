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
  "1w",
  "1m",
  "3m",
  "1y",
];

const PRESET_TO_KEY: Record<SalesRangePreset, keyof SalesTotals> = {
  today: "today",
  "1d": "oneDayAgo",
  "1w": "oneWeekAgo",
  "1m": "oneMonthAgo",
  "3m": "threeMonthsAgo",
  "1y": "oneYearAgo",
};

export const fetchSales = createAsyncThunk(
  "sales/fetchSales",
  async (userId: string) => {
    const totals: SalesTotals = {
      today: 0,
      oneDayAgo: 0,
      oneWeekAgo: 0,
      oneMonthAgo: 0,
      threeMonthsAgo: 0,
      oneYearAgo: 0,
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

export const addSale = createAsyncThunk(
  "sales/addSale",
  async ({ userId, amount }: AddSalePayload) => {
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
        }),
      },
    );

    // Local log persistence should never block a successful sale write.
    const recentLog: RecentLogType = {
      id: result.id,
      userId: result.userId,
      amount: result.amount,
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
      `${API_BASE_URL}${API_ENDPOINTS.SALE.BY_ID}/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount,
        }),
      },
    );

    return result;
  },
);

export const deleteSale = createAsyncThunk(
  "sales/deleteSale",
  async ({ id, userId }: DeleteSalePayload) => {
    const result = await apiFetcher<DeleteSaleResponse>(
      `${API_BASE_URL}${API_ENDPOINTS.SALE.BY_ID}/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      },
    );

    return result;
  },
);

const initialState: SaleState = {
  sales: {
    today: 0,
    oneDayAgo: 0,
    oneWeekAgo: 0,
    oneMonthAgo: 0,
    threeMonthsAgo: 0,
    oneYearAgo: 0,
  },
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
      });
  },
});

export default saleSlice.reducer;
