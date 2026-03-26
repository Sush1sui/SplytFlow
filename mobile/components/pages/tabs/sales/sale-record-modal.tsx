import React, { useCallback, useEffect, useMemo, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Modal, Pressable } from "react-native";
import { Button, Input, Paragraph, XStack, YStack } from "tamagui";
import { formatDateOnly } from "@/lib/utils/calendar-helper";
import {
  buildCalendarDays,
  canGoToNextMonth,
  getCalendarCursor,
  getInitialLocalDate,
  getInitialLocalTime,
  getTodayParts,
  isValidLocalTime,
  parseAmount,
  toAmountInput,
} from "@/lib/utils/sale-record-modal-helper";
import {
  amountInputStyle,
  closeButtonStyle,
  fieldButtonStyle,
  fieldTextStyle,
  labelStyle,
  leftAdornmentStyle,
  overlayStyle,
  rightAdornmentStyle,
  sheetStyle,
  submitButtonBaseStyle,
  submitTextStyle,
  titleStyle,
} from "@/components/pages/tabs/sales/sale-record-modal.styles";
import SaleDatePickerModal from "@/components/pages/tabs/sales/sale-date-picker-modal";
import SaleTimePickerModal from "@/components/pages/tabs/sales/sale-time-picker-modal";

type SaleRecordModalProps = {
  visible: boolean;
  mode: "add" | "edit";
  saleCreatedAt?: string | null;
  initialAmount?: number | null;
  onClose?: () => void;
  onSubmit?: (amount: number, localDate?: string, localTime?: string) => void;
  pending?: boolean;
  currency?: string;
};

export default function SaleRecordModal({
  visible,
  mode,
  saleCreatedAt,
  initialAmount,
  onClose,
  onSubmit,
  pending = false,
  currency = "$",
}: SaleRecordModalProps) {
  const today = useMemo(getTodayParts, []);

  const [amountInput, setAmountInput] = useState("");
  const [selectedLocalDate, setSelectedLocalDate] = useState("");
  const [selectedLocalTime, setSelectedLocalTime] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [calendarYear, setCalendarYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [calendarMonth, setCalendarMonth] = useState<number>(
    new Date().getMonth(),
  );

  useEffect(() => {
    if (!visible) return;
    setAmountInput(toAmountInput(initialAmount));
  }, [visible, initialAmount]);

  useEffect(() => {
    if (!visible) return;

    const initialLocalDate = getInitialLocalDate(saleCreatedAt);
    const initialLocalTime = getInitialLocalTime(saleCreatedAt);
    const { year, month } = getCalendarCursor(initialLocalDate);

    setSelectedLocalDate(initialLocalDate);
    setSelectedLocalTime(initialLocalTime);
    setCalendarYear(year);
    setCalendarMonth(month);
  }, [visible, saleCreatedAt]);

  const dateLabel = selectedLocalDate || "yyyy-mm-dd";
  const calendarDays = useMemo(
    () => buildCalendarDays(calendarYear, calendarMonth),
    [calendarMonth, calendarYear],
  );
  const canGoNextMonth = useMemo(
    () => canGoToNextMonth(calendarYear, calendarMonth, today),
    [calendarMonth, calendarYear, today],
  );
  const parsedAmount = useMemo(() => parseAmount(amountInput), [amountInput]);
  const canSubmitTime = mode === "edit" || isValidLocalTime(selectedLocalTime);

  const canSubmit =
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    !pending &&
    canSubmitTime;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit?.(
      parsedAmount,
      mode === "add" ? selectedLocalDate : undefined,
      mode === "add" ? selectedLocalTime : undefined,
    );
  }, [
    canSubmit,
    mode,
    onSubmit,
    parsedAmount,
    selectedLocalDate,
    selectedLocalTime,
  ]);

  const handleOpenPicker = useCallback(() => {
    if (mode !== "add" || pending) return;

    const { year, month } = getCalendarCursor(selectedLocalDate);
    setCalendarYear(year);
    setCalendarMonth(month);

    setPickerVisible(true);
  }, [mode, pending, selectedLocalDate]);

  const handleOpenTimePicker = useCallback(() => {
    if (mode !== "add" || pending) return;
    setTimePickerVisible(true);
  }, [mode, pending]);

  const handlePickDay = useCallback(
    (day: number) => {
      setSelectedLocalDate(formatDateOnly(calendarYear, calendarMonth, day));
      setPickerVisible(false);
    },
    [calendarMonth, calendarYear],
  );

  const handlePreviousMonth = useCallback(() => {
    setCalendarMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCalendarYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    if (!canGoNextMonth) return;

    setCalendarMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCalendarYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  }, [canGoNextMonth]);

  const submitButtonStyle = {
    ...submitButtonBaseStyle,
    backgroundColor: canSubmit ? "#4f46e5" : "#a5b4fc",
    borderColor: canSubmit ? "#4f46e5" : "#a5b4fc",
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          ...overlayStyle,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{ width: "100%" }}
        >
          <YStack style={sheetStyle} gap="$2.5">
            <XStack
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
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
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#7b8699"
                />
              </Button>
            </XStack>

            <YStack gap="$2.5">
              <YStack gap="$1">
                <Paragraph style={labelStyle}>Date</Paragraph>
                <YStack style={{ position: "relative" }}>
                  <Button
                    unstyled
                    onPress={handleOpenPicker}
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
                    style={amountInputStyle}
                  />
                  <YStack style={leftAdornmentStyle}>
                    <Paragraph
                      style={{
                        color: "#8a97aa",
                        fontWeight: "700",
                        fontSize: 16,
                      }}
                    >
                      {currency}
                    </Paragraph>
                  </YStack>
                </YStack>
              </YStack>

              <YStack gap="$1">
                <Paragraph style={labelStyle}>Time</Paragraph>
                <YStack style={{ position: "relative" }}>
                  <Button
                    unstyled
                    onPress={handleOpenTimePicker}
                    style={fieldButtonStyle}
                  >
                    <Paragraph style={fieldTextStyle}>
                      {selectedLocalTime}
                    </Paragraph>
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

            <Button
              disabled={!canSubmit}
              onPress={handleSubmit}
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
        </Pressable>
      </Pressable>

      <SaleDatePickerModal
        visible={pickerVisible}
        calendarYear={calendarYear}
        calendarMonth={calendarMonth}
        calendarDays={calendarDays}
        selectedLocalDate={selectedLocalDate}
        today={today}
        canGoNextMonth={canGoNextMonth}
        onClose={() => setPickerVisible(false)}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onPickDay={handlePickDay}
      />

      <SaleTimePickerModal
        visible={timePickerVisible}
        localTime={selectedLocalTime}
        onClose={() => setTimePickerVisible(false)}
        onChange={setSelectedLocalTime}
      />
    </Modal>
  );
}
