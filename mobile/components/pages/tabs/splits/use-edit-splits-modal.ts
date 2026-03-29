import { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions } from "react-native";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useAppDispatch } from "@/lib/store/hooks";
import { createSplit, deleteSplit, updateSplit } from "@/lib/store/splitSlice";
import type { SplitRow } from "@/types/split.types";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type DraftSplit = {
  /** undefined means it's a new (not-yet-persisted) split */
  id?: string;
  name: string;
  value: string; // kept as string for input
  /** marks a row that should be deleted on save */
  deleted?: boolean;
};

type UseEditSplitsModalOptions = {
  visible: boolean;
  groupId: string | null;
  userId: string;
  splits: SplitRow[];
  onClose?: () => void;
};

export function useEditSplitsModal({
  visible,
  groupId,
  userId,
  splits,
  onClose,
}: UseEditSplitsModalOptions) {
  // ─── Draft state ──────────────────────────────────────────────────────────
  const [draft, setDraft] = useState<DraftSplit[]>([]);
  const [saving, setSaving] = useState(false);

  // Reset draft whenever the modal opens or the target group changes
  useEffect(() => {
    if (visible) {
      setDraft(
        splits.map((s) => ({ id: s.id, name: s.name, value: String(s.value) }))
      );
    }
  }, [visible, groupId]);

  // ─── Draft helpers ────────────────────────────────────────────────────────
  const addRow = useCallback(() => {
    setDraft((prev) => [...prev, { name: "", value: "" }]);
  }, []);

  const updateRow = useCallback(
    (index: number, field: "name" | "value", text: string) => {
      setDraft((prev) =>
        prev.map((row, i) => (i === index ? { ...row, [field]: text } : row))
      );
    },
    []
  );

  const deleteRow = useCallback((index: number) => {
    setDraft((prev) => {
      const row = prev[index];
      if (row.id) {
        // persisted → mark for deletion
        return prev.map((r, i) => (i === index ? { ...r, deleted: true } : r));
      }
      // new (local only) → just remove
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ─── Totals ───────────────────────────────────────────────────────────────
  const totalDeduction = useMemo(() => {
    return draft
      .filter((r) => !r.deleted)
      .reduce((sum, r) => sum + (parseFloat(r.value) || 0), 0);
  }, [draft]);

  const visibleDraft = useMemo(() => draft.filter((r) => !r.deleted), [draft]);

  // ─── Validation ───────────────────────────────────────────────────────────
  const canSave = useMemo(() => {
    const rows = draft.filter((r) => !r.deleted);
    // every non-deleted row must have a name and a numeric value > 0
    return rows.every(
      (r) => r.name.trim().length > 0 && parseFloat(r.value) > 0
    );
  }, [draft]);

  // ─── Animation ────────────────────────────────────────────────────────────
  const [modalMounted, setModalMounted] = useState(false);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setModalMounted(true);
      opacity.value = withTiming(1, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withSpring(0, {
        damping: 24,
        stiffness: 220,
        mass: 0.9,
      });
    } else {
      opacity.value = withTiming(0, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
      });
      translateY.value = withTiming(
        SCREEN_HEIGHT,
        { duration: 240, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setModalMounted)(false);
        }
      );
    }
  }, [visible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // ─── Save ─────────────────────────────────────────────────────────────────
  const dispatch = useAppDispatch();

  const handleSave = useCallback(async () => {
    if (!canSave || !groupId) return;
    setSaving(true);

    const originalMap = new Map(splits.map((s) => [s.id, s]));

    const promises: Promise<unknown>[] = [];

    for (const row of draft) {
      if (row.deleted && row.id) {
        // Delete persisted split
        promises.push(dispatch(deleteSplit({ id: row.id, userId })));
      } else if (!row.id) {
        // New split — create
        const value = parseFloat(row.value);
        if (row.name.trim() && value > 0) {
          promises.push(
            dispatch(
              createSplit({
                userId,
                name: row.name.trim(),
                value,
                splitCategoryId: groupId,
              })
            )
          );
        }
      } else {
        // Existing — update if changed
        const orig = originalMap.get(row.id);
        const newValue = parseFloat(row.value);
        if (
          orig &&
          (orig.name !== row.name.trim() || orig.value !== newValue)
        ) {
          promises.push(
            dispatch(
              updateSplit({
                id: row.id,
                userId,
                name: row.name.trim(),
                value: newValue,
              })
            )
          );
        }
      }
    }

    await Promise.all(promises);
    setSaving(false);
    onClose?.();
  }, [canSave, draft, groupId, splits, userId, dispatch, onClose]);

  return {
    // animation
    modalMounted,
    overlayAnimatedStyle,
    sheetAnimatedStyle,
    // draft
    visibleDraft,
    totalDeduction,
    addRow,
    updateRow,
    deleteRow,
    // state
    canSave,
    saving,
    handleSave,
  };
}
