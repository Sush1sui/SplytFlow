import { RecentLogType } from "@/types/sale.types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  loadRecentLogs,
  addRecentLog,
  clearRecentLogs,
  removeRecentLogByIndex,
} from "../utils/sale";

const initialState = {
  list: [] as RecentLogType[],
  status: "idle" as "idle" | "loading" | "succeeded" | "failed",
  error: null as string | null,
};

export const hydrateLogs = createAsyncThunk("logs/hydrateLogs", async () => {
  return await loadRecentLogs();
});

export const appendLog = createAsyncThunk(
  "logs/appendLog",
  async (payload: { log: RecentLogType }) => {
    await addRecentLog(payload.log);
    return await loadRecentLogs();
  },
);

export const deleteLogByIndex = createAsyncThunk(
  "logs/deleteLogByIndex",
  async (index: number) => {
    await removeRecentLogByIndex(index);
    return await loadRecentLogs();
  },
);

export const clearAllLogs = createAsyncThunk("logs/clearAllLogs", async () => {
  await clearRecentLogs();
  return [] as RecentLogType[];
});

const logSlice = createSlice({
  name: "log",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hydrateLogs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(hydrateLogs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(hydrateLogs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Load logs failed";
      })
      .addCase(appendLog.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(deleteLogByIndex.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(clearAllLogs.fulfilled, (state, action) => {
        state.list = action.payload;
      });
  },
});

export default logSlice.reducer;
