import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useEditSplitsModal } from "./use-edit-splits-modal";
import EditSplitsSheet from "./edit-splits-sheet";
import type { SplitRow } from "@/types/split.types";

type EditSplitsModalProps = {
  visible: boolean;
  groupId: string | null;
  groupName: string;
  userId: string;
  splits: SplitRow[];
  onClose?: () => void;
};

export default function EditSplitsModal({
  visible,
  groupId,
  groupName,
  userId,
  splits,
  onClose,
}: EditSplitsModalProps) {
  const {
    modalMounted,
    overlayAnimatedStyle,
    sheetAnimatedStyle,
    visibleDraft,
    totalDeduction,
    addRow,
    updateRow,
    deleteRow,
    canSave,
    saving,
    handleSave,
  } = useEditSplitsModal({ visible, groupId, userId, splits, onClose });

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
      {/* Backdrop */}
      {Platform.OS === "ios" ? (
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(0,0,0,0.55)" },
          ]}
        />
      )}

      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Pressable
          onPress={onClose}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ width: "100%" }}
          >
            <Animated.View style={sheetAnimatedStyle}>
              <EditSplitsSheet
                groupName={groupName}
                visibleDraft={visibleDraft}
                totalDeduction={totalDeduction}
                saving={saving}
                canSave={canSave}
                onClose={onClose}
                onAddRow={addRow}
                onUpdateRow={updateRow}
                onDeleteRow={deleteRow}
                onSave={handleSave}
              />
            </Animated.View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}
