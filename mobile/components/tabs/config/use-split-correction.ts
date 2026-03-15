import { useCallback, useEffect, useMemo, useState } from "react";

import { API_ENDPOINTS } from "@/constants/api";
import { markSalesAnalyticsDirty } from "@/lib/state/sales-analytics-cache";
import { authenticatedFetch } from "@/lib/utils/auth-fetch";
import type { SplitFeedback, SplitRule } from "./types";
import { parseApiMessage } from "./split-rules-utils";
import {
  buildCorrectionPayload,
  createDraftId,
  mapRulesToDraft,
  toStartOfLocalDay,
  type DraftBreakdownItem,
} from "./split-correction-payload";

type ApplyCorrectionResult =
  | { status: "ok"; openEnded: boolean }
  | { status: "needs-confirmation" }
  | { status: "invalid" };

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
