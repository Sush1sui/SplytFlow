import { t } from "elysia";

export type GetSplitCategoriesQuery = { userId: string };

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
  }),
  splitCategoryUpsertBody: t.Object({
    userId: t.String(),
    name: t.String(),
  }),
  splitCategoryDeleteBody: t.Object({
    userId: t.String(),
  }),
};
