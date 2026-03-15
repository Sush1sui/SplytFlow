import { useCallback, useEffect, useMemo, useState } from "react";

import { API_ENDPOINTS } from "@/constants/api";
import { authenticatedFetch } from "@/lib/utils/auth-fetch";
import { ApiError } from "@/lib/utils/api-fetcher";
import { markSalesAnalyticsDirty } from "@/lib/state/sales-analytics-cache";
import type { SplitFeedback, SplitRule } from "./types";
import {
  MAX_TOTAL_SPLIT,
  formatPct,
  parseApiMessage,
} from "./split-rules-utils";
import {
  validateSaveRuleInput,
  validateSplitRuleFields,
} from "./split-rules-validation";

export function useSplitRules(userId?: string) {
  const [rules, setRules] = useState<SplitRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [feedback, setFeedback] = useState<SplitFeedback>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [valueTouched, setValueTouched] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);

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

  const fieldErrors = useMemo(
    () =>
      validateSplitRuleFields({
        editingName,
        nameInput,
        valueInput,
        rules,
        totalSplitPct,
      }),
    [editingName, nameInput, valueInput, rules, totalSplitPct],
  );

  const showInlineErrors = saveAttempted || nameTouched || valueTouched;
  const nameError = showInlineErrors ? fieldErrors.name : undefined;
  const valueError = showInlineErrors ? fieldErrors.value : undefined;

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
        const response = await authenticatedFetch<SplitRule[]>(
          API_ENDPOINTS.SPLIT.BY_USER(userId),
          { method: "GET" },
        );
        setRules(Array.isArray(response) ? response : []);
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

  const resetForm = useCallback(() => {
    setEditingName(null);
    setNameInput("");
    setValueInput("");
    setNameTouched(false);
    setValueTouched(false);
    setSaveAttempted(false);
  }, []);

  const startEditRule = useCallback((rule: SplitRule) => {
    setEditingName(rule.name);
    setNameInput(rule.name);
    setValueInput(String(rule.value));
    setNameTouched(false);
    setValueTouched(false);
    setSaveAttempted(false);
    setFeedback(null);
  }, []);

  const onNameInputChange = useCallback((value: string) => {
    setNameTouched(true);
    setNameInput(value);
  }, []);

  const onValueInputChange = useCallback((value: string) => {
    setValueTouched(true);
    setValueInput(value);
  }, []);

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

      await authenticatedFetch<SplitRule>(API_ENDPOINTS.SPLIT.UPSERT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: targetName,
          value: validation.value,
        }),
      });

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
    totalSplitPct,
    userId,
    valueInput,
  ]);

  const deleteRule = useCallback(
    async (name: string) => {
      if (!userId) return;

      try {
        setDeletingName(name);
        await authenticatedFetch(API_ENDPOINTS.SPLIT.DELETE, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, name }),
        });

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
      await authenticatedFetch(API_ENDPOINTS.SPLIT.DELETE_ALL_BY_USER(userId), {
        method: "DELETE",
      });

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
    startEditRule,
    resetForm,
    saveRule,
    deleteRule,
    deleteAllRules,
  };
}
