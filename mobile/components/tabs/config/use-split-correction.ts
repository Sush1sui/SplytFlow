import { useCallback, useEffect, useMemo, useState } from "react";

import { API_ENDPOINTS } from "@/constants/api";
import { markSalesAnalyticsDirty } from "@/lib/state/sales-analytics-cache";
import { authenticatedFetch } from "@/lib/utils/auth-fetch";
import type { SplitFeedback, SplitRule } from "./types";
import { CAP_EPSILON, parseApiMessage } from "./split-rules-utils";

type DraftBreakdownItem = {
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

type ApplyCorrectionResult =
  | { status: "ok"; openEnded: boolean }
  | { status: "needs-confirmation" }
  | { status: "invalid" };

const MAX_TOTAL_SPLIT = 100;

const toStartOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

function createDraftId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function mapRulesToDraft(rules: SplitRule[]): DraftBreakdownItem[] {
  return [...rules]
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .map((rule) => ({
      id: createDraftId(),
      name: rule.name,
      value: String(rule.value),
    }));
}

function buildCorrectionPayload(
  userId: string | undefined,
  startAtDate: Date | null,
  endAtDate: Date | null,
  reasonInput: string,
  draftItems: DraftBreakdownItem[],
): { payload: CorrectionPayload | null; error: string | null } {
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

    // Allow empty placeholder rows in the editor.
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

export function useSplitCorrection(
  userId: string | undefined,
  rules: SplitRule[],
  onApplied: () => void,
) {
  const [startAtDate, setStartAtDate] = useState<Date | null>(null);
  const [endAtDate, setEndAtDate] = useState<Date | null>(null);
  const [reasonInput, setReasonInput] = useState("");
  const [draftItems, setDraftItems] = useState<DraftBreakdownItem[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<SplitFeedback>(null);

  useEffect(() => {
    if (draftItems.length === 0 && rules.length > 0) {
      setDraftItems(mapRulesToDraft(rules));
    }
  }, [draftItems.length, rules]);

  const correctionTotal = useMemo(
    () =>
      draftItems.reduce((sum, item) => {
        const value = Number(item.value);
        if (!Number.isFinite(value) || value < 0) return sum;
        return sum + value;
      }, 0),
    [draftItems],
  );

  const addDraftItem = useCallback(() => {
    setDraftItems((prev) => [
      ...prev,
      { id: createDraftId(), name: "", value: "" },
    ]);
  }, []);

  const removeDraftItem = useCallback((id: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateDraftName = useCallback((id: string, name: string) => {
    setDraftItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item)),
    );
  }, []);

  const updateDraftValue = useCallback((id: string, value: string) => {
    setDraftItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value } : item)),
    );
  }, []);

  const onSetStartAtDate = useCallback((next: Date | null) => {
    if (!next) {
      setStartAtDate(null);
      setEndAtDate(null);
      return;
    }

    const normalizedNext = toStartOfLocalDay(next);
    setStartAtDate(normalizedNext);

    setEndAtDate((prev) => {
      if (!prev) return prev;
      const normalizedPrev = toStartOfLocalDay(prev);
      return normalizedPrev.getTime() < normalizedNext.getTime()
        ? null
        : normalizedPrev;
    });
  }, []);

  const onSetEndAtDate = useCallback((next: Date | null) => {
    if (!next) {
      setEndAtDate(null);
      return;
    }

    setEndAtDate(toStartOfLocalDay(next));
  }, []);

  const clearEndAtDate = useCallback(() => {
    setEndAtDate(null);
  }, []);

  const applyCorrection = useCallback(
    async (confirmOpenEnded = false): Promise<ApplyCorrectionResult> => {
      const { payload, error } = buildCorrectionPayload(
        userId,
        startAtDate,
        endAtDate,
        reasonInput,
        draftItems,
      );

      if (error || !payload) {
        setFeedback({
          type: "error",
          text: error ?? "Invalid correction payload.",
        });
        return { status: "invalid" };
      }

      const openEnded = !payload.endAt;
      if (openEnded && !confirmOpenEnded) {
        return { status: "needs-confirmation" };
      }

      try {
        setSubmitting(true);

        await authenticatedFetch(API_ENDPOINTS.SPLIT.HISTORY_CORRECT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (userId) {
          markSalesAnalyticsDirty(userId);
        }

        onApplied();

        setFeedback({
          type: "success",
          text: payload.endAt
            ? "Historical correction applied for the selected window."
            : "Open-ended correction applied and synced to current split rules.",
        });

        return { status: "ok", openEnded };
      } catch (error) {
        const parsedMessage = parseApiMessage(
          error,
          "Could not apply correction.",
        );
        const userMessage = /no effective timeline change/i.test(parsedMessage)
          ? "No change detected for that date range. Try adjusting the dates or values."
          : parsedMessage;

        setFeedback({
          type: "error",
          text: userMessage,
        });
        return { status: "invalid" };
      } finally {
        setSubmitting(false);
      }
    },
    [draftItems, endAtDate, onApplied, reasonInput, startAtDate, userId],
  );

  return {
    startAtDate,
    endAtDate,
    reasonInput,
    draftItems,
    correctionTotal,
    submitting,
    feedback,
    setStartAtDate: onSetStartAtDate,
    setEndAtDate: onSetEndAtDate,
    clearEndAtDate,
    setReasonInput,
    addDraftItem,
    removeDraftItem,
    updateDraftName,
    updateDraftValue,
    applyCorrection,
  };
}
