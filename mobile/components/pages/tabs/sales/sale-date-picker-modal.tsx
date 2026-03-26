import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Modal, Pressable } from "react-native";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import { MONTH_NAMES, WEEKDAY_LABELS } from "@/constants/sales";
import { parseDateParts } from "@/lib/utils/calendar-helper";
import { isFutureCalendarDay } from "@/lib/utils/sale-record-modal-helper";
import {
  calendarDayCellStyle,
  calendarHeaderCellStyle,
  calendarNavButtonStyle,
  overlayStyle,
  pickerCardStyle,
  pickerTitleStyle,
} from "@/components/pages/tabs/sales/sale-record-modal.styles";

type DateParts = {
  year: number;
  month: number;
  day: number;
};

type SaleDatePickerModalProps = {
  visible: boolean;
  calendarYear: number;
  calendarMonth: number;
  calendarDays: number[];
  selectedLocalDate: string;
  today: DateParts;
  canGoNextMonth: boolean;
  onClose: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onPickDay: (day: number) => void;
};

function SaleDatePickerModal({
  visible,
  calendarYear,
  calendarMonth,
  calendarDays,
  selectedLocalDate,
  today,
  canGoNextMonth,
  onClose,
  onPreviousMonth,
  onNextMonth,
  onPickDay,
}: SaleDatePickerModalProps) {
  const selectedDateParts = parseDateParts(selectedLocalDate);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          ...overlayStyle,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Pressable onPress={(event) => event.stopPropagation()}>
          <YStack style={pickerCardStyle} gap="$2.5">
            <Paragraph style={pickerTitleStyle}>Select Date</Paragraph>

            <XStack
              style={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Button
                unstyled
                onPress={onPreviousMonth}
                style={calendarNavButtonStyle}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={20}
                  color="#475569"
                />
              </Button>

              <Paragraph
                style={{ color: "#0f172a", fontWeight: "700", fontSize: 16 }}
              >
                {MONTH_NAMES[calendarMonth]} {calendarYear}
              </Paragraph>

              <Button
                unstyled
                onPress={onNextMonth}
                disabled={!canGoNextMonth}
                style={calendarNavButtonStyle}
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#475569"
                />
              </Button>
            </XStack>

            <XStack style={{ flexWrap: "wrap" }}>
              {WEEKDAY_LABELS.map((label) => (
                <YStack key={label} style={calendarHeaderCellStyle}>
                  <Paragraph
                    style={{
                      color: "#64748b",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {label}
                  </Paragraph>
                </YStack>
              ))}

              {calendarDays.map((day, index) => {
                if (day === 0) {
                  return (
                    <YStack
                      key={`empty-${index}`}
                      style={calendarDayCellStyle}
                    />
                  );
                }

                const isSelected =
                  selectedDateParts?.year === calendarYear &&
                  selectedDateParts?.month === calendarMonth &&
                  selectedDateParts?.day === day;

                const isFutureDay = isFutureCalendarDay(
                  calendarYear,
                  calendarMonth,
                  day,
                  today,
                );

                return (
                  <YStack
                    key={`day-${calendarYear}-${calendarMonth}-${day}`}
                    style={calendarDayCellStyle}
                  >
                    <Button
                      unstyled
                      disabled={isFutureDay}
                      onPress={() => onPickDay(day)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isSelected ? "#4f46e5" : "transparent",
                        opacity: isFutureDay ? 0.35 : 1,
                      }}
                    >
                      <Paragraph
                        style={{
                          color: isSelected ? "#ffffff" : "#0f172a",
                          fontWeight: isSelected ? "700" : "500",
                          fontSize: 14,
                        }}
                      >
                        {day}
                      </Paragraph>
                    </Button>
                  </YStack>
                );
              })}
            </XStack>

            <XStack style={{ justifyContent: "flex-end" }} gap="$2">
              <Button
                unstyled
                chromeless
                onPress={onClose}
                style={{ paddingHorizontal: 8, height: 34 }}
              >
                <Paragraph style={{ color: "#64748b", fontWeight: "600" }}>
                  Close
                </Paragraph>
              </Button>
            </XStack>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default React.memo(SaleDatePickerModal);
