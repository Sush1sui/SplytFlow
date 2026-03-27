import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { ApiError, apiFetcher } from "../api";
import type {
  SplitDeletePayload,
  SplitGroupDeletePayload,
  SplitGroupRow,
  SplitGroupUpdatePayload,
  SplitGroupUpsertPayload,
  SplitGroupWithSplits,
  SplitRow,
  SplitState,
  SplitUpdatePayload,
  SplitUpsertPayload,
  SuccessMessageResponse,
} from "@/types/split.types";

const ACTIVE_SPLIT_GROUP_KEY = "active_split_group_id";

const initialState: SplitState = {
  splitGroups: [],
  activeSplitGroupId: null,
  status: "idle",
  error: null,
};

function removeSplitById(
  splitGroups: SplitGroupWithSplits[],
  splitId: string,
): SplitGroupWithSplits[] {
  return splitGroups.map((group) => ({
    ...group,
    splits: group.splits.filter((split) => split.id !== splitId),
  }));
}

export const hydrateActiveSplitGroup = createAsyncThunk(
  "split/hydrateActiveSplitGroup",
  async () => {
    const persisted = await SecureStore.getItemAsync(ACTIVE_SPLIT_GROUP_KEY);
    return persisted || null;
  },
);

export const setActiveSplitGroup = createAsyncThunk(
  "split/setActiveSplitGroup",
  async (splitGroupId: string | null) => {
    if (splitGroupId) {
      await SecureStore.setItemAsync(ACTIVE_SPLIT_GROUP_KEY, splitGroupId);
      return splitGroupId;
    }

    await SecureStore.deleteItemAsync(ACTIVE_SPLIT_GROUP_KEY);
    return null;
  },
);

export const fetchSplitGroupsWithSplits = createAsyncThunk(
  "split/fetchSplitGroupsWithSplits",
  async (userId: string) => {
    const splitGroups = await apiFetcher<SplitGroupWithSplits[]>(
      `/splits/categories?userId=${encodeURIComponent(userId)}&includeSplits=true`,
    );

    return splitGroups;
  },
);

export const createSplitGroup = createAsyncThunk(
  "split/createSplitGroup",
  async (payload: SplitGroupUpsertPayload) => {
    return apiFetcher<SplitGroupRow>("/splits/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
);

export const updateSplitGroup = createAsyncThunk(
  "split/updateSplitGroup",
  async ({ id, ...payload }: SplitGroupUpdatePayload) => {
    return apiFetcher<SplitGroupRow>(`/splits/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
);

export const deleteSplitGroup = createAsyncThunk(
  "split/deleteSplitGroup",
  async ({ id, userId }: SplitGroupDeletePayload) => {
    await apiFetcher<SuccessMessageResponse>(`/splits/categories/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    return id;
  },
);

export const createSplit = createAsyncThunk(
  "split/createSplit",
  async (payload: SplitUpsertPayload) => {
    return apiFetcher<SplitRow>("/splits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
);

export const updateSplit = createAsyncThunk(
  "split/updateSplit",
  async ({ id, ...payload }: SplitUpdatePayload) => {
    return apiFetcher<SplitRow>(`/splits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
);

export const deleteSplit = createAsyncThunk(
  "split/deleteSplit",
  async ({ id, userId }: SplitDeletePayload) => {
    await apiFetcher<SuccessMessageResponse>(
      `/splits/${id}?userId=${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
      },
    );

    return id;
  },
);

const splitSlice = createSlice({
  name: "split",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hydrateActiveSplitGroup.fulfilled, (state, action) => {
        state.activeSplitGroupId = action.payload;
      })
      .addCase(setActiveSplitGroup.fulfilled, (state, action) => {
        state.activeSplitGroupId = action.payload;
      })
      .addCase(fetchSplitGroupsWithSplits.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSplitGroupsWithSplits.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.splitGroups = action.payload;

        if (state.splitGroups.length === 0) {
          state.activeSplitGroupId = null;
          return;
        }

        const activeStillExists = state.splitGroups.some(
          (group) => group.id === state.activeSplitGroupId,
        );

        if (!activeStillExists) {
          state.activeSplitGroupId = state.splitGroups[0].id;
        }
      })
      .addCase(fetchSplitGroupsWithSplits.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch split groups";
      })
      .addCase(createSplitGroup.fulfilled, (state, action) => {
        state.splitGroups.push({ ...action.payload, splits: [] });
      })
      .addCase(updateSplitGroup.fulfilled, (state, action) => {
        state.splitGroups = state.splitGroups.map((group) => {
          if (group.id !== action.payload.id) {
            return group;
          }

          return { ...action.payload, splits: group.splits };
        });
      })
      .addCase(deleteSplitGroup.fulfilled, (state, action) => {
        state.splitGroups = state.splitGroups.filter(
          (group) => group.id !== action.payload,
        );

        if (state.activeSplitGroupId === action.payload) {
          state.activeSplitGroupId = state.splitGroups[0]?.id ?? null;
        }
      })
      .addCase(createSplit.fulfilled, (state, action) => {
        state.splitGroups = state.splitGroups.map((group) => {
          if (group.id !== action.payload.splitCategoryId) {
            return group;
          }

          return { ...group, splits: [...group.splits, action.payload] };
        });
      })
      .addCase(updateSplit.fulfilled, (state, action) => {
        state.splitGroups = state.splitGroups.map((group) => ({
          ...group,
          splits: group.splits.map((split) => {
            if (split.id !== action.payload.id) {
              return split;
            }

            return action.payload;
          }),
        }));
      })
      .addCase(deleteSplit.fulfilled, (state, action) => {
        state.splitGroups = removeSplitById(state.splitGroups, action.payload);
      });
  },
});

export default splitSlice.reducer;
