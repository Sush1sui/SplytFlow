import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Input, Paragraph, XStack, YStack } from "tamagui";
import {
  closeButtonStyle,
  labelStyle,
  nameInputStyle,
  sheetStyle,
  submitButtonBaseStyle,
  submitTextStyle,
  titleStyle,
} from "./add-split-group-modal.styles";

type AddSplitGroupSheetProps = {
  onClose?: () => void;
  groupName: string;
  setGroupName: (v: string) => void;
  canSubmit: boolean;
  pending: boolean;
  submitButtonStyle: object;
  onSubmit: () => void;
};

export default function AddSplitGroupSheet({
  onClose,
  groupName,
  setGroupName,
  canSubmit,
  pending,
  submitButtonStyle,
  onSubmit,
}: AddSplitGroupSheetProps) {
  return (
    <YStack style={sheetStyle} gap="$2.5">
      {/* Header */}
      <XStack style={{ justifyContent: "space-between", alignItems: "center" }}>
        <Paragraph style={titleStyle}>New Split Group</Paragraph>
        <Button
          unstyled
          chromeless
          onPress={onClose}
          pressStyle={{ opacity: 0.7, background: "transparent" }}
          style={closeButtonStyle}
        >
          <MaterialCommunityIcons name="close" size={22} color="#7b8699" />
        </Button>
      </XStack>

      {/* Group Name field */}
      <YStack gap="$1">
        <Paragraph style={labelStyle}>Group Name</Paragraph>
        <Input
          value={groupName}
          onChangeText={setGroupName}
          placeholder="e.g. Weekend Config"
          placeholderTextColor="#94a3b8"
          style={nameInputStyle}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
      </YStack>

      {/* Submit */}
      <Button
        disabled={!canSubmit}
        onPress={onSubmit}
        style={submitButtonStyle}
        pressStyle={{ opacity: 0.88 }}
      >
        <Paragraph style={submitTextStyle}>
          {pending ? "Creating..." : "Create Group"}
        </Paragraph>
      </Button>
    </YStack>
  );
}
