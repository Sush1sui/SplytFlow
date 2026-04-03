import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Input, Paragraph, XStack, YStack } from "tamagui";
import {
  amountInputStyle,
  closeButtonStyle,
  fieldButtonStyle,
  fieldTextStyle,
  labelStyle,
  leftAdornmentStyle,
  rightAdornmentStyle,
  sheetStyle,
  submitTextStyle,
  titleStyle,
} from "./sale-record-modal.styles";

type SaleRecordModalSheetProps = {
  mode: "add" | "edit";
  currency: string;
  pending: boolean;
  onClose?: () => void;
  // amount
  amountInput: string;
  setAmountInput: (v: string) => void;
  // date
  dateLabel: string;
  onOpenPicker: () => void;
  // time
  selectedLocalTime: string;
  onOpenTimePicker: () => void;
  // submit
  canSubmit: boolean;
  submitButtonStyle: object;
  onSubmit: () => void;
};

export default function SaleRecordModalSheet({
  mode,
  currency,
  pending,
  onClose,
  amountInput,
  setAmountInput,
  dateLabel,
  onOpenPicker,
  selectedLocalTime,
  onOpenTimePicker,
  canSubmit,
  submitButtonStyle,
  onSubmit,
}: SaleRecordModalSheetProps) {
  const amountInputLeftPadding = currency.length >= 3 ? 56 : 48;

  return (
    <YStack style={sheetStyle} gap="$2.5">
      {/* Header */}
      <XStack style={{ justifyContent: "space-between", alignItems: "center" }}>
        <Paragraph style={titleStyle}>
          {mode === "add" ? "Add Sale Record" : "Edit Sale Record"}
        </Paragraph>
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

      <YStack gap="$2.5">
        {/* Date field */}
        <YStack gap="$1">
          <Paragraph style={labelStyle}>Date</Paragraph>
          <YStack style={{ position: "relative" }}>
            <Button
              unstyled
              onPress={onOpenPicker}
              disabled={mode !== "add" || pending}
              style={fieldButtonStyle}
            >
              <Paragraph style={fieldTextStyle}>{dateLabel}</Paragraph>
            </Button>
            <YStack style={leftAdornmentStyle}>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={18}
                color="#9aa5b6"
              />
            </YStack>
            <YStack style={rightAdornmentStyle}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={18}
                color={mode === "add" ? "#0f172a" : "#94a3b8"}
              />
            </YStack>
          </YStack>
        </YStack>

        {/* Amount field */}
        <YStack gap="$1">
          <Paragraph style={labelStyle}>Total Amount</Paragraph>
          <YStack style={{ position: "relative" }}>
            <Input
              editable={!pending}
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              style={{
                ...amountInputStyle,
                paddingLeft: amountInputLeftPadding,
              }}
            />
            <YStack
              style={{
                ...leftAdornmentStyle,
                minWidth: 34,
                alignItems: "center",
              }}
            >
              <Paragraph
                style={{ color: "#8a97aa", fontWeight: "700", fontSize: 16 }}
              >
                {currency}
              </Paragraph>
            </YStack>
          </YStack>
        </YStack>

        {/* Time field */}
        <YStack gap="$1">
          <Paragraph style={labelStyle}>Time</Paragraph>
          <YStack style={{ position: "relative" }}>
            <Button
              unstyled
              onPress={onOpenTimePicker}
              style={fieldButtonStyle}
            >
              <Paragraph style={fieldTextStyle}>{selectedLocalTime}</Paragraph>
            </Button>
            <YStack style={leftAdornmentStyle}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color="#9aa5b6"
              />
            </YStack>
            <YStack style={rightAdornmentStyle}>
              <MaterialCommunityIcons
                name="clock-time-four-outline"
                size={18}
                color={mode === "add" ? "#0f172a" : "#94a3b8"}
              />
            </YStack>
          </YStack>
        </YStack>
      </YStack>

      {/* Submit */}
      <Button
        disabled={!canSubmit}
        onPress={onSubmit}
        style={submitButtonStyle}
      >
        <Paragraph style={submitTextStyle}>
          {pending
            ? mode === "add"
              ? "Saving..."
              : "Updating..."
            : mode === "add"
              ? "Save Record"
              : "Update Record"}
        </Paragraph>
      </Button>
    </YStack>
  );
}
