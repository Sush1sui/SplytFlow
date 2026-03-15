import type { SplitRule } from "./types";
import { CAP_EPSILON } from "./split-rules-utils";

export type DraftBreakdownItem = {
  id: string;
  name: string;
  value: string;
};

type CorrectionPayload = {
  userId: string;
  startAt: string;
  endAt?: string;
  breakdown: { name: string; value: number }[];
  reason?: string;
};

type BuildCorrectionPayloadResult = {
  payload: CorrectionPayload | null;
  error: string | null;
};

const MAX_TOTAL_SPLIT = 100;

export const toStartOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export function createDraftId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function mapRulesToDraft(rules: SplitRule[]): DraftBreakdownItem[] {
  return [...rules]
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .map((rule) => ({
      id: createDraftId(),
      name: rule.name,
      value: String(rule.value),
    }));
}

export function buildCorrectionPayload(
  userId: string | undefined,
  startAtDate: Date | null,
  endAtDate: Date | null,
  reasonInput: string,
  draftItems: DraftBreakdownItem[],
): BuildCorrectionPayloadResult {
  if (!userId) {
    return {
      payload: null,
      error: "Missing user session. Please sign in again.",
    };
  }

  if (!startAtDate) {
    return { payload: null, error: "Start date is required." };
  }

  const startParsed = toStartOfLocalDay(startAtDate);
  let endParsed: Date | null = null;

  if (endAtDate) {
    const normalizedEndDate = toStartOfLocalDay(endAtDate);

    if (normalizedEndDate.getTime() < startParsed.getTime()) {
      return {
        payload: null,
        error: "End date must be the same day or later than start date.",
      };
    }

    // The backend expects endAt as an exclusive restore boundary.
    endParsed = addDays(normalizedEndDate, 1);
  }

  if (!endParsed && startParsed.getTime() > Date.now()) {
    return {
      payload: null,
      error: "Open-ended correction cannot start in the future.",
    };
  }

  const seen = new Set<string>();
  const normalizedBreakdown: { name: string; value: number }[] = [];

  for (const item of draftItems) {
    const name = item.name.trim();
    const valueRaw = item.value.trim();

    if (!name && !valueRaw) {
      continue;
    }

    if (!name) {
      return {
        payload: null,
        error: "Each correction row needs a rule name.",
      };
    }

    if (!valueRaw) {
      return {
        payload: null,
        error: `Rule '${name}' is missing a percentage value.`,
      };
    }

    const value = Number(valueRaw);
    if (!Number.isFinite(value) || value < 0) {
      return {
        payload: null,
        error: `Rule '${name}' must have a non-negative numeric value.`,
      };
    }

    const key = name.toLowerCase();
    if (seen.has(key)) {
      return {
        payload: null,
        error: `Duplicate rule name in correction: '${name}'.`,
      };
    }

    seen.add(key);
    normalizedBreakdown.push({ name, value });
  }

  if (normalizedBreakdown.length === 0) {
    return {
      payload: null,
      error: "Add at least one correction breakdown rule.",
    };
  }

  const total = normalizedBreakdown.reduce((sum, item) => sum + item.value, 0);
  if (total > MAX_TOTAL_SPLIT + CAP_EPSILON) {
    return {
      payload: null,
      error: "Correction total cannot exceed 100%.",
    };
  }

  const reason = reasonInput.trim();

  return {
    payload: {
      userId,
      startAt: startParsed.toISOString(),
      endAt: endParsed ? endParsed.toISOString() : undefined,
      breakdown: normalizedBreakdown,
      reason: reason || undefined,
    },
    error: null,
  };
}
