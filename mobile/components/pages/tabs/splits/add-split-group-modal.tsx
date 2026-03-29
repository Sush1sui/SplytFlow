import React from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useAddSplitGroupModal } from "./use-add-split-group-modal";
import AddSplitGroupSheet from "./add-split-group-sheet";

type AddSplitGroupModalProps = {
  visible: boolean;
  pending?: boolean;
  onClose?: () => void;
  onSubmit?: (groupName: string) => void;
};

export default function AddSplitGroupModal({
  visible,
  pending = false,
  onClose,
  onSubmit,
}: AddSplitGroupModalProps) {
  const {
    modalMounted,
    overlayAnimatedStyle,
    sheetAnimatedStyle,
    groupName,
    setGroupName,
    canSubmit,
    submitButtonStyle,
    handleSubmit,
  } = useAddSplitGroupModal({ visible, pending, onSubmit });

  if (!modalMounted && !visible) return null;

  return (
    <Animated.View
      pointerEvents={modalMounted ? "auto" : "none"}
      style={[
        StyleSheet.absoluteFillObject,
        { justifyContent: "flex-end", zIndex: 99999, elevation: 99999 },
        overlayAnimatedStyle,
      ]}
    >
      {/* Backdrop: native blur on iOS, semi-transparent overlay on Android */}
      {Platform.OS === "ios" ? (
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0, 0, 0, 0.55)" }]}
        />
      )}

      {/* Tap outside to dismiss — KAV lifts the sheet above the keyboard */}
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Pressable onPress={onClose} style={{ flex: 1, justifyContent: "flex-end" }}>
          {/* Stop propagation so tapping the sheet itself doesn't close */}
          <Pressable onPress={(e) => e.stopPropagation()} style={{ width: "100%" }}>
            <Animated.View style={sheetAnimatedStyle}>
              <AddSplitGroupSheet
                onClose={onClose}
                groupName={groupName}
                setGroupName={setGroupName}
                canSubmit={canSubmit}
                pending={pending}
                submitButtonStyle={submitButtonStyle}
                onSubmit={handleSubmit}
              />
            </Animated.View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}
