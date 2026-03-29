import { useCallback, useEffect, useState } from "react";
import { Dimensions } from "react-native";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { submitButtonBaseStyle } from "./add-split-group-modal.styles";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type UseAddSplitGroupModalOptions = {
  visible: boolean;
  pending?: boolean;
  onSubmit?: (groupName: string) => void;
};

export function useAddSplitGroupModal({ visible, pending = false, onSubmit }: UseAddSplitGroupModalOptions) {
  // ─── Form state ───────────────────────────────────────────────────────────
  const [groupName, setGroupName] = useState("");

  // ─── Animation ────────────────────────────────────────────────────────────
  const [modalMounted, setModalMounted] = useState(false);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setModalMounted(true);
      opacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
      translateY.value = withSpring(0, { damping: 24, stiffness: 220, mass: 0.9 });
    } else {
      opacity.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) });
      translateY.value = withTiming(
        SCREEN_HEIGHT,
        { duration: 240, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setModalMounted)(false);
        },
      );
    }
  }, [visible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // ─── Reset on open ────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setGroupName("");
    }
  }, [visible]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const canSubmit = groupName.trim().length > 0 && !pending;

  const submitButtonStyle = {
    ...submitButtonBaseStyle,
    backgroundColor: canSubmit ? "#4f46e5" : "#a5b4fc",
    borderColor: canSubmit ? "#4f46e5" : "#a5b4fc",
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit?.(groupName.trim());
  }, [canSubmit, groupName, onSubmit]);

  return {
    // animation
    modalMounted,
    overlayAnimatedStyle,
    sheetAnimatedStyle,
    // form state
    groupName,
    setGroupName,
    // submit
    canSubmit,
    submitButtonStyle,
    handleSubmit,
  };
}
