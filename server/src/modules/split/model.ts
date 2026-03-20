export type GetAllSplitsQuery = {
  splitCategoryId: string;
  userId: string;
};

export type GetSplitByIdQuery = {
  userId: string;
};

export type SplitIdParams = {
  id: string;
};

export type UpdateSplitBody = {
  userId: string;
  name: string;
  value: number;
};

export type CreateSplitBody = {
  userId: string;
  name: string;
  value: number;
  splitCategoryId: string;
};

export type DeleteSplitQuery = {
  userId: string;
};

export type SplitServiceErrorCode =
  | "validation"
  | "not_found"
  | "limit_exceeded";
