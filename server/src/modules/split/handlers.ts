import * as splitService from "./service";
import {
  SplitCorrectionValidationError,
  SplitLimitExceededError,
} from "./service";
import {
  DeleteSplitBody,
  SplitCreateOrUpdateBody,
  SplitHistoryCorrectBody,
} from "./model";

type RouteContext = {
  params: Record<string, string>;
  query: Record<string, string | undefined>;
  body: unknown;
  set: { status?: number | string };
};

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unknown error occurred";
}

export async function handleGetCorrectionHistory({
  params,
  query,
  set,
}: RouteContext) {
  try {
    const { userId } = params;

    if (!userId) {
      set.status = 400;
      return { error: "userId is required" };
    }

    const rawLimit = query.limit;
    const hasLimit = typeof rawLimit === "string";
    const parsedLimit = hasLimit ? Number(rawLimit) : undefined;

    if (
      hasLimit &&
      (parsedLimit === undefined ||
        !Number.isFinite(parsedLimit) ||
        parsedLimit <= 0)
    ) {
      set.status = 400;
      return { error: "limit must be a positive number" };
    }

    const corrections = await splitService.getCorrectionHistoryByUserId(
      userId,
      parsedLimit,
    );

    set.status = 200;
    return { corrections };
  } catch (error) {
    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}

export async function handleGetSplitHistoryTimeline({
  params,
  set,
}: RouteContext) {
  try {
    const { userId } = params;

    if (!userId) {
      set.status = 400;
      return { error: "userId is required" };
    }

    const timeline = await splitService.getSplitHistoryTimelineByUserId(userId);

    set.status = 200;
    return { timeline };
  } catch (error) {
    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}

export async function handleGetSplits({ params, set }: RouteContext) {
  try {
    const { id } = params;

    const splits = await splitService.getSplitsByUserId(id);
    if (!splits || splits.length === 0) {
      set.status = 404;
      return { error: "No splits found for this user" };
    }

    set.status = 200;
    return splits;
  } catch (error) {
    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}

export async function handleUpsertSplit({ body, set }: RouteContext) {
  try {
    const { userId, name, value } = body as SplitCreateOrUpdateBody;

    if (!userId || !name || value === undefined) {
      set.status = 400;
      return { error: "userId, name, and value are required" };
    }

    const { split, created } = await splitService
      .upsert(userId, name, value)
      .then((split) => ({
        split,
        created:
          !split.updatedAt ||
          split.createdAt.getTime() === split.updatedAt.getTime(),
      }));

    set.status = created ? 201 : 200;
    return split;
  } catch (error) {
    if (error instanceof SplitLimitExceededError) {
      set.status = 400;
      return { error: error.message };
    }

    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}

export async function handleDeleteSplit({ body, set }: RouteContext) {
  try {
    const { userId, name } = body as DeleteSplitBody;

    if (!userId || !name) {
      set.status = 400;
      return { error: "userId and name are required" };
    }

    const deletedSplit = await splitService.deleteSplitByName(userId, name);
    if (!deletedSplit) {
      set.status = 404;
      return { error: "Split not found" };
    }

    set.status = 200;
    return deletedSplit;
  } catch (error) {
    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}

export async function handleDeleteAllSplits({ params, set }: RouteContext) {
  try {
    const { userId } = params;
    if (!userId) {
      set.status = 400;
      return { error: "userId is required" };
    }

    await splitService.deleteAllSplitsByUserId(userId);
    set.status = 200;
    return { message: `Deleted all splits for user ${userId}` };
  } catch (error) {
    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}

export async function handleApplyHistoricalCorrection({
  body,
  set,
}: RouteContext) {
  try {
    const { userId, startAt, endAt, breakdown, reason } =
      body as SplitHistoryCorrectBody;

    if (!userId || !startAt || !Array.isArray(breakdown)) {
      set.status = 400;
      return {
        error: "userId, startAt, and breakdown array are required",
      };
    }

    const startDate = new Date(startAt);
    const endDate = endAt ? new Date(endAt) : undefined;

    const result = await splitService.applyHistoricalCorrection(
      userId,
      startDate,
      endDate,
      breakdown,
      reason,
    );

    set.status = 200;
    return result;
  } catch (error) {
    if (
      error instanceof SplitCorrectionValidationError ||
      error instanceof SplitLimitExceededError
    ) {
      set.status = 400;
      return { error: error.message };
    }

    set.status = 500;
    return { error: toErrorMessage(error) };
  }
}
