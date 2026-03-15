import { useCallback, useMemo, useState } from "react";

import type { SplitRule } from "./types";
import { validateSplitRuleFields } from "./split-rules-validation";

type UseSplitRuleFormArgs = {
  rules: SplitRule[];
  totalSplitPct: number;
};

export function useSplitRuleForm({
  rules,
  totalSplitPct,
}: UseSplitRuleFormArgs) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [valueTouched, setValueTouched] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);

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
  }, []);

  const onNameInputChange = useCallback((value: string) => {
    setNameTouched(true);
    setNameInput(value);
  }, []);

  const onValueInputChange = useCallback((value: string) => {
    setValueTouched(true);
    setValueInput(value);
  }, []);

  return {
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
  };
}
