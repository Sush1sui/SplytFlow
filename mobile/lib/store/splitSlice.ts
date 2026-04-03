import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { apiFetcher } from "../api";
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
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";

export const ACTIVE_SPLIT_GROUP_KEY = "active_split_group_id";

const initialState: SplitState = {
  splitGroups: [],
  activeSplitGroupId: null,
  status: "idle",
  error: null,
  createGroupPending: false,
  createGroupError: null,
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

function pickDefaultSplitGroupId(
  splitGroups: SplitGroupWithSplits[],
): string | null {
  if (splitGroups.length === 0) return null;

  // Use oldest created group as deterministic fallback across devices.
  const sortedGroups = [...splitGroups].sort((a, b) => {
    const left = Date.parse(a.createdAt);
    const right = Date.parse(b.createdAt);

    if (Number.isNaN(left) && Number.isNaN(right)) {
      return a.id.localeCompare(b.id);
    }
    if (Number.isNaN(left)) return 1;
    if (Number.isNaN(right)) return -1;

    return left - right;
  });

  return sortedGroups[0]?.id ?? null;
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
      `${API_BASE_URL}${API_ENDPOINTS.SPLIT_CATEGORY.LIST}?userId=${encodeURIComponent(userId)}&includeSplits=true`,
    );

    return splitGroups;
  },
);

export const createSplitGroup = createAsyncThunk(
  "split/createSplitGroup",
  async (payload: SplitGroupUpsertPayload) => {
    return apiFetcher<SplitGroupRow>(
      `${API_BASE_URL}${API_ENDPOINTS.SPLIT_CATEGORY.CREATE}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
  },
);

export const updateSplitGroup = createAsyncThunk(
  "split/updateSplitGroup",
  async ({ id, ...payload }: SplitGroupUpdatePayload) => {
    return apiFetcher<SplitGroupRow>(
      `${API_BASE_URL}${API_ENDPOINTS.SPLIT_CATEGORY.BY_ID(id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
  },
);

export const deleteSplitGroup = createAsyncThunk(
  "split/deleteSplitGroup",
  async ({ id, userId }: SplitGroupDeletePayload) => {
    await apiFetcher<SuccessMessageResponse>(
      `${API_BASE_URL}${API_ENDPOINTS.SPLIT_CATEGORY.BY_ID(id)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      },
    );

    return id;
  },
);

export const createSplit = createAsyncThunk(
  "split/createSplit",
  async (payload: SplitUpsertPayload) => {
    return apiFetcher<SplitRow>(
      `${API_BASE_URL}${API_ENDPOINTS.SPLIT.CREATE}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
  },
);

export const updateSplit = createAsyncThunk(
  "split/updateSplit",
  async ({ id, ...payload }: SplitUpdatePayload) => {
    return apiFetcher<SplitRow>(
      `${API_BASE_URL}${API_ENDPOINTS.SPLIT.BY_ID(id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
  },
);

export const deleteSplit = createAsyncThunk(
  "split/deleteSplit",
  async ({ id, userId }: SplitDeletePayload) => {
    await apiFetcher<SuccessMessageResponse>(
      `${API_BASE_URL}${API_ENDPOINTS.SPLIT.BY_ID(id)}?userId=${encodeURIComponent(userId)}`,
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
          state.activeSplitGroupId = pickDefaultSplitGroupId(state.splitGroups);
        }
      })
      .addCase(fetchSplitGroupsWithSplits.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch split groups";
      })
      .addCase(createSplitGroup.pending, (state) => {
        state.createGroupPending = true;
        state.createGroupError = null;
      })
      .addCase(createSplitGroup.fulfilled, (state, action) => {
        state.createGroupPending = false;
        state.splitGroups.push({ ...action.payload, splits: [] });

        // If this is the first group created, make it active immediately.
        if (!state.activeSplitGroupId) {
          state.activeSplitGroupId = action.payload.id;
        }
      })
      .addCase(createSplitGroup.rejected, (state, action) => {
        state.createGroupPending = false;
        state.createGroupError =
          action.error.message ?? "Failed to create group";
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
          state.activeSplitGroupId = pickDefaultSplitGroupId(state.splitGroups);
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
