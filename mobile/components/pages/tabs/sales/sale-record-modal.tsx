import React from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSaleRecordModal } from "./use-sale-record-modal";
import SaleRecordModalSheet from "./sale-record-modal-sheet";
import SaleDatePickerModal from "./sale-date-picker-modal";
import SaleTimePickerModal from "./sale-time-picker-modal";

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
  const {
    modalMounted,
    overlayAnimatedStyle,
    sheetAnimatedStyle,
    amountInput,
    setAmountInput,
    selectedLocalDate,
    selectedLocalTime,
    setSelectedLocalTime,
    dateLabel,
    calendarYear,
    calendarMonth,
    calendarDays,
    canGoNextMonth,
    today,
    pickerVisible,
    setPickerVisible,
    timePickerVisible,
    setTimePickerVisible,
    canSubmit,
    submitButtonStyle,
    handleSubmit,
    handleOpenPicker,
    handleOpenTimePicker,
    handlePickDay,
    handlePreviousMonth,
    handleNextMonth,
  } = useSaleRecordModal({ visible, mode, saleCreatedAt, initialAmount, pending, onSubmit });

  if (!modalMounted && !visible) return null;

  return (
    <>
      <Animated.View
        pointerEvents={modalMounted ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFillObject,
          { justifyContent: "flex-end", zIndex: 99999, elevation: 99999 },
          overlayAnimatedStyle,
        ]}
      >
        {/* Graceful fallback: native glass on iOS, smooth fade on Android */}
        {Platform.OS === "ios" ? (
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0, 0, 0, 0.55)" }]} />
        )}

        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <Pressable onPress={onClose} style={{ flex: 1, justifyContent: "flex-end" }}>
            <Pressable onPress={(e) => e.stopPropagation()} style={{ width: "100%" }}>
              <Animated.View style={sheetAnimatedStyle}>
                <SaleRecordModalSheet
                  mode={mode}
                  currency={currency}
                  pending={pending}
                  onClose={onClose}
                  amountInput={amountInput}
                  setAmountInput={setAmountInput}
                  dateLabel={dateLabel}
                  onOpenPicker={handleOpenPicker}
                  selectedLocalTime={selectedLocalTime}
                  onOpenTimePicker={handleOpenTimePicker}
                  canSubmit={canSubmit}
                  submitButtonStyle={submitButtonStyle}
                  onSubmit={handleSubmit}
                />
              </Animated.View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Animated.View>

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
    </>
  );
}
