import { RecentLogType } from "@/types/sale.types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loadRecentLogs, addRecentLog } from "../utils/sale";

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

const logSlice = createSlice({
  name: "log",
  initialState,
  reducers: {
    clearLogs(state) {
      state.list = [];
    },
  },
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
      });
  },
});

export const { clearLogs } = logSlice.actions;
export default logSlice.reducer;
