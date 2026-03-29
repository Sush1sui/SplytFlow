export type SplitGroupRow = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type SplitRow = {
  id: string;
  splitCategoryId: string;
  name: string;
  value: number;
  createdAt: string;
  updatedAt: string;
};

export type SplitGroupWithSplits = SplitGroupRow & {
  splits: SplitRow[];
};

export type SplitState = {
  splitGroups: SplitGroupWithSplits[];
  activeSplitGroupId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  createGroupPending: boolean;
  createGroupError: string | null;
};

export type SplitGroupUpsertPayload = {
  userId: string;
  name: string;
};

export type SplitGroupUpdatePayload = SplitGroupUpsertPayload & {
  id: string;
};

export type SplitGroupDeletePayload = {
  id: string;
  userId: string;
};

export type SplitUpsertPayload = {
  userId: string;
  name: string;
  value: number;
  splitCategoryId: string;
};

export type SplitUpdatePayload = {
  id: string;
  userId: string;
  name: string;
  value: number;
};

export type SplitDeletePayload = {
  id: string;
  userId: string;
};

export type SuccessMessageResponse = {
  message: string;
};
