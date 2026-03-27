import { t } from "elysia";

export type GetSplitCategoriesQuery = {
  userId: string;
  includeSplits?: string;
};

export type GetSplitCategoryByIdQuery = { userId: string };

export type SplitCategoryIdParams = { id: string };

export type CreateOrUpdateSplitCategoryBody = { userId: string; name: string };

export type DeleteSplitCategoryBody = { userId: string };

export const splitCategorySchema = {
  splitCategoryIdParams: t.Object({
    id: t.String(),
  }),
  splitCategoryUserQuery: t.Object({
    userId: t.String(),
    includeSplits: t.Optional(t.Union([t.Literal("true"), t.Literal("false")])),
  }),
  splitCategoryUpsertBody: t.Object({
    userId: t.String(),
    name: t.String(),
  }),
  splitCategoryDeleteBody: t.Object({
    userId: t.String(),
  }),
};

export interface SplitCategoryWithSplits {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  splits: {
    id: string;
    splitCategoryId: string;
    name: string;
    value: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
