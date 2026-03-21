import { t } from "elysia";
import { SplitServiceError } from "./service";

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

export const splitSchema = {
  splitIdParams: t.Object({
    id: t.String(),
  }),
  getAllSplitsQuery: t.Object({
    splitCategoryId: t.String(),
    userId: t.String(),
  }),
  getSplitByIdQuery: t.Object({
    userId: t.String(),
  }),
  createSplitBody: t.Object({
    userId: t.String(),
    name: t.String(),
    value: t.Number(),
    splitCategoryId: t.String(),
  }),
  updateSplitBody: t.Object({
    userId: t.String(),
    name: t.String(),
    value: t.Number(),
  }),
  deleteSplitQuery: t.Object({
    userId: t.String(),
  }),
};

export function splitErrorStatus(error: unknown) {
  if (error instanceof SplitServiceError) {
    if (error.code === "validation" || error.code === "limit_exceeded") {
      return 400;
    }

    if (error.code === "not_found") {
      return 404;
    }
  }

  return 500;
}
