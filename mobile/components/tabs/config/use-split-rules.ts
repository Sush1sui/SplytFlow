import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/utils/api-fetcher";
import { markSalesAnalyticsDirty } from "@/lib/state/sales-analytics-cache";
import type { SplitFeedback, SplitRule } from "./types";
import {
  MAX_TOTAL_SPLIT,
  formatPct,
  parseApiMessage,
} from "./split-rules-utils";
import { validateSaveRuleInput } from "./split-rules-validation";
import {
  deleteAllSplitRules,
  deleteSplitRule,
  fetchSplitRules,
  upsertSplitRule,
} from "./split-rules-requests";
import { useSplitRuleForm } from "./use-split-rule-form";

export function useSplitRules(userId?: string) {
  const [rules, setRules] = useState<SplitRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const [feedback, setFeedback] = useState<SplitFeedback>(null);

  const sortedRules = useMemo(
    () =>
      [...rules].sort(
        (a, b) => b.value - a.value || a.name.localeCompare(b.name),
      ),
    [rules],
  );

  const totalSplitPct = useMemo(
    () => rules.reduce((sum, rule) => sum + rule.value, 0),
    [rules],
  );

  const retainedPct = Math.max(0, MAX_TOTAL_SPLIT - totalSplitPct);

  const {
    editingName,
    nameInput,
    valueInput,
    nameError,
    valueError,
    setSaveAttempted,
    resetForm,
    startEditRule,
    onNameInputChange,
    onValueInputChange,
  } = useSplitRuleForm({ rules, totalSplitPct });

  const loadRules = useCallback(
    async (isRefresh = false) => {
      if (!userId) {
        setRules([]);
        setLoadingRules(false);
        if (isRefresh) setRefreshing(false);
        return;
      }

      if (!isRefresh) setLoadingRules(true);

      try {
        const response = await fetchSplitRules(userId);
        setRules(response);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setRules([]);
        } else {
          setFeedback({
            type: "error",
            text: parseApiMessage(error, "Could not load split rules."),
          });
        }
      } finally {
        setLoadingRules(false);
        if (isRefresh) setRefreshing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    void loadRules(false);
  }, [loadRules]);

  const refreshRules = useCallback(() => {
    setRefreshing(true);
    void loadRules(true);
  }, [loadRules]);

  const startEditRuleWithFeedbackReset = useCallback(
    (rule: SplitRule) => {
      startEditRule(rule);
      setFeedback(null);
    },
    [startEditRule],
  );

  const saveRule = useCallback(async () => {
    if (!userId) {
      setFeedback({
        type: "error",
        text: "Missing user session. Please sign in again.",
      });
      return;
    }

    setSaveAttempted(true);

    const validation = validateSaveRuleInput({
      editingName,
      nameInput,
      valueInput,
      rules,
      totalSplitPct,
    });

    if (!validation.ok) {
      setFeedback({ type: "error", text: validation.message });
      return;
    }

    try {
      setSaving(true);
      const targetName = editingName ?? validation.name;

      await upsertSplitRule(userId, targetName, validation.value);

      markSalesAnalyticsDirty(userId);
      await loadRules(true);
      resetForm();

      setFeedback({
        type: "success",
        text: editingName
          ? `Updated ${targetName} to ${formatPct(validation.value)}.`
          : `Added ${targetName} at ${formatPct(validation.value)}.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: parseApiMessage(error, "Could not save split rule."),
      });
    } finally {
      setSaving(false);
    }
  }, [
    editingName,
    loadRules,
    nameInput,
    resetForm,
    rules,
    setSaveAttempted,
    totalSplitPct,
    userId,
    valueInput,
  ]);

  const deleteRule = useCallback(
    async (name: string) => {
      if (!userId) return;

      try {
        setDeletingName(name);
        await deleteSplitRule(userId, name);

        markSalesAnalyticsDirty(userId);
        await loadRules(true);

        if (editingName === name) {
          resetForm();
        }

        setFeedback({ type: "success", text: `Deleted ${name}.` });
      } catch (error) {
        setFeedback({
          type: "error",
          text: parseApiMessage(error, "Could not delete split rule."),
        });
      } finally {
        setDeletingName(null);
      }
    },
    [editingName, loadRules, resetForm, userId],
  );

  const deleteAllRules = useCallback(async () => {
    if (!userId) return;

    try {
      setDeletingAll(true);
      await deleteAllSplitRules(userId);

      markSalesAnalyticsDirty(userId);
      await loadRules(true);
      resetForm();
      setFeedback({ type: "success", text: "Deleted all split rules." });
    } catch (error) {
      setFeedback({
        type: "error",
        text: parseApiMessage(error, "Could not delete all split rules."),
      });
    } finally {
      setDeletingAll(false);
    }
  }, [loadRules, resetForm, userId]);

  return {
    rules: sortedRules,
    loadingRules,
    refreshing,
    saving,
    deletingName,
    deletingAll,
    editingName,
    nameInput,
    valueInput,
    nameError,
    valueError,
    feedback,
    totalSplitPct,
    retainedPct,
    setNameInput: onNameInputChange,
    setValueInput: onValueInputChange,
    refreshRules,
    startEditRule: startEditRuleWithFeedbackReset,
    resetForm,
    saveRule,
    deleteRule,
    deleteAllRules,
  };
}
