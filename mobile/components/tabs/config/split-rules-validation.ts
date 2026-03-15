import type { SplitRule, SplitRuleFieldErrors } from "./types";
import {
  CAP_EPSILON,
  MAX_TOTAL_SPLIT,
  normalizeRuleName,
} from "./split-rules-utils";

type SaveRuleValidationInput = {
  editingName: string | null;
  nameInput: string;
  valueInput: string;
  rules: SplitRule[];
  totalSplitPct: number;
};

type SaveRuleValidationResult =
  | { ok: true; name: string; value: number }
  | { ok: false; message: string };

type SplitRuleFieldValidationInput = SaveRuleValidationInput;

export function validateSplitRuleFields({
  editingName,
  nameInput,
  valueInput,
  rules,
  totalSplitPct,
}: SplitRuleFieldValidationInput): SplitRuleFieldErrors {
  const errors: SplitRuleFieldErrors = {};
  const normalizedName = normalizeRuleName(nameInput);
  const parsedValue = Number(valueInput);

  if (!normalizedName) {
    errors.name = "Rule name is required.";
  } else if (!editingName) {
    const duplicate = rules.some(
      (rule) => rule.name.toLowerCase() === normalizedName.toLowerCase(),
    );

    if (duplicate) {
      errors.name = "A rule with this name already exists.";
    }
  }

  if (!Number.isFinite(parsedValue) || parsedValue <= 0 || parsedValue > 100) {
    errors.value =
      "Enter a valid percentage value greater than 0 and up to 100.";
  } else {
    const previousValue = editingName
      ? (rules.find((rule) => rule.name === editingName)?.value ?? 0)
      : 0;
    const projectedTotal = totalSplitPct - previousValue + parsedValue;

    if (projectedTotal > MAX_TOTAL_SPLIT + CAP_EPSILON) {
      errors.value = "Total splits cannot exceed 100%.";
    }
  }

  return errors;
}

export function validateSaveRuleInput({
  editingName,
  nameInput,
  valueInput,
  rules,
  totalSplitPct,
}: SaveRuleValidationInput): SaveRuleValidationResult {
  const normalizedName = normalizeRuleName(nameInput);
  const parsedValue = Number(valueInput);
  const errors = validateSplitRuleFields({
    editingName,
    nameInput,
    valueInput,
    rules,
    totalSplitPct,
  });

  if (errors.name) {
    return { ok: false, message: errors.name };
  }

  if (errors.value) {
    return { ok: false, message: errors.value };
  }

  return { ok: true, name: normalizedName, value: parsedValue };
}
