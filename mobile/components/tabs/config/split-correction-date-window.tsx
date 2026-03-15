import React, { useCallback, useMemo, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/themed-text";
import useSplitRulesStyles from "./split-rules-stylesheet";

type SplitCorrectionDateWindowProps = {
  startAtDate: Date | null;
  endAtDate: Date | null;
  submitting: boolean;
  iconColor: string;
  onSetStartAtDate: (value: Date | null) => void;
  onSetEndAtDate: (value: Date | null) => void;
  onClearEndAtDate: () => void;
};

export function SplitCorrectionDateWindow({
  startAtDate,
  endAtDate,
  submitting,
  iconColor,
  onSetStartAtDate,
  onSetEndAtDate,
  onClearEndAtDate,
}: SplitCorrectionDateWindowProps) {
  const splitStyles = useSplitRulesStyles();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDateLabel = useCallback((date: Date | null) => {
    if (!date) return "Select date";

    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const openStartPicker = useCallback(() => {
    if (submitting) return;

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: startAtDate ?? new Date(),
        mode: "date",
        display: "default",
        onChange: (_event: DateTimePickerEvent, selectedDate?: Date) => {
          if (selectedDate) {
            onSetStartAtDate(selectedDate);
          }
        },
      });
      return;
    }

    setShowStartPicker((prev) => !prev);
  }, [onSetStartAtDate, startAtDate, submitting]);

  const openEndPicker = useCallback(() => {
    if (submitting) return;

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: endAtDate ?? startAtDate ?? new Date(),
        mode: "date",
        display: "default",
        minimumDate: startAtDate ?? undefined,
        onChange: (_event: DateTimePickerEvent, selectedDate?: Date) => {
          if (selectedDate) {
            onSetEndAtDate(selectedDate);
          }
        },
      });
      return;
    }

    setShowEndPicker((prev) => !prev);
  }, [endAtDate, onSetEndAtDate, startAtDate, submitting]);

  const onStartPickerChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (selectedDate) {
        onSetStartAtDate(selectedDate);
      }
    },
    [onSetStartAtDate],
  );

  const onEndPickerChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (selectedDate) {
        onSetEndAtDate(selectedDate);
      }
    },
    [onSetEndAtDate],
  );

  const correctionWindowText = useMemo(() => {
    if (!startAtDate) {
      return "Pick a start date to define the correction window.";
    }

    if (!endAtDate) {
      return `Applies from ${formatDateLabel(startAtDate)} onward and updates current split rules.`;
    }

    return `Applies to sales from ${formatDateLabel(startAtDate)} through ${formatDateLabel(endAtDate)}.`;
  }, [endAtDate, formatDateLabel, startAtDate]);

  return (
    <>
      <View style={splitStyles.correctionDateSection}>
        <ThemedText style={[splitStyles.manageLabelLike, { color: iconColor }]}>
          Start Date
        </ThemedText>
        <TouchableOpacity
          activeOpacity={0.82}
          disabled={submitting}
          onPress={openStartPicker}
          style={[
            splitStyles.correctionDateButton,
            {
              borderColor: `${iconColor}40`,
              backgroundColor: `${iconColor}10`,
              opacity: submitting ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText style={splitStyles.correctionDateText}>
            {formatDateLabel(startAtDate)}
          </ThemedText>
          <Ionicons name="calendar-outline" size={16} color={iconColor} />
        </TouchableOpacity>

        {Platform.OS === "ios" && showStartPicker ? (
          <DateTimePicker
            value={startAtDate ?? new Date()}
            mode="date"
            display="spinner"
            onChange={onStartPickerChange}
          />
        ) : null}
      </View>

      <View style={splitStyles.correctionDateSection}>
        <View style={splitStyles.correctionDateHeaderRow}>
          <ThemedText
            style={[splitStyles.manageLabelLike, { color: iconColor }]}
          >
            End Date (optional)
          </ThemedText>
          {endAtDate ? (
            <TouchableOpacity
              activeOpacity={0.76}
              onPress={onClearEndAtDate}
              disabled={submitting}
              style={[
                splitStyles.actionChip,
                {
                  borderColor: `${iconColor}32`,
                  backgroundColor: `${iconColor}0D`,
                  opacity: submitting ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons name="close-outline" size={14} color={iconColor} />
              <ThemedText
                style={[splitStyles.actionText, { color: iconColor }]}
              >
                Clear
              </ThemedText>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          disabled={submitting}
          onPress={openEndPicker}
          style={[
            splitStyles.correctionDateButton,
            {
              borderColor: `${iconColor}40`,
              backgroundColor: `${iconColor}10`,
              opacity: submitting ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText style={splitStyles.correctionDateText}>
            {endAtDate ? formatDateLabel(endAtDate) : "No end date = current"}
          </ThemedText>
          <Ionicons name="calendar-outline" size={16} color={iconColor} />
        </TouchableOpacity>

        {Platform.OS === "ios" && showEndPicker ? (
          <DateTimePicker
            value={endAtDate ?? startAtDate ?? new Date()}
            mode="date"
            display="spinner"
            onChange={onEndPickerChange}
            minimumDate={startAtDate ?? undefined}
          />
        ) : null}

        <ThemedText style={[splitStyles.summaryHint, { color: iconColor }]}>
          Leave this empty if you want the correction to stay active from the
          start date onward.
        </ThemedText>
      </View>

      <View
        style={[
          splitStyles.correctionWindowCard,
          {
            borderColor: `${iconColor}30`,
            backgroundColor: `${iconColor}0C`,
          },
        ]}
      >
        <ThemedText
          style={[splitStyles.correctionWindowTitle, { color: iconColor }]}
        >
          Correction Window
        </ThemedText>
        <ThemedText style={splitStyles.correctionWindowText}>
          {correctionWindowText}
        </ThemedText>
      </View>
    </>
  );
}
