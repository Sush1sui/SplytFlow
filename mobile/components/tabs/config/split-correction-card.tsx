import React, { useCallback, useMemo, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemedText } from "@/components/themed-text";
import type { SplitFeedback } from "./types";
import { formatPct } from "./split-rules-utils";
import useSplitRulesStyles from "./split-rules-stylesheet";

type DraftBreakdownItem = {
  id: string;
  name: string;
  value: string;
};

type SplitCorrectionCardProps = {
  startAtDate: Date | null;
  endAtDate: Date | null;
  reasonInput: string;
  draftItems: DraftBreakdownItem[];
  correctionTotal: number;
  submitting: boolean;
  feedback: SplitFeedback;
  tint: string;
  iconColor: string;
  onSetStartAtDate: (value: Date | null) => void;
  onSetEndAtDate: (value: Date | null) => void;
  onClearEndAtDate: () => void;
  onSetReasonInput: (value: string) => void;
  onAddDraftItem: () => void;
  onRemoveDraftItem: (id: string) => void;
  onUpdateDraftName: (id: string, value: string) => void;
  onUpdateDraftValue: (id: string, value: string) => void;
  onApplyCorrection: () => void;
};

export function SplitCorrectionCard({
  startAtDate,
  endAtDate,
  reasonInput,
  draftItems,
  correctionTotal,
  submitting,
  feedback,
  tint,
  iconColor,
  onSetStartAtDate,
  onSetEndAtDate,
  onClearEndAtDate,
  onSetReasonInput,
  onAddDraftItem,
  onRemoveDraftItem,
  onUpdateDraftName,
  onUpdateDraftValue,
  onApplyCorrection,
}: SplitCorrectionCardProps) {
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
    <Card style={splitStyles.correctionCard}>
      <View style={splitStyles.correctionHeaderRow}>
        <ThemedText style={splitStyles.formTitle}>
          Historical Correction
        </ThemedText>
      </View>

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

      <Input
        label="Reason (optional)"
        value={reasonInput}
        onChangeText={onSetReasonInput}
        editable={!submitting}
        placeholder="e.g. Rent should be 25%"
        autoCapitalize="sentences"
      />

      <View style={splitStyles.correctionRowsWrap}>
        <View style={splitStyles.correctionRowsHeader}>
          <ThemedText style={splitStyles.listTitle}>
            Correction Breakdown
          </ThemedText>
          <TouchableOpacity
            activeOpacity={0.76}
            onPress={onAddDraftItem}
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
            <Ionicons name="add-outline" size={14} color={iconColor} />
            <ThemedText style={[splitStyles.actionText, { color: iconColor }]}>
              Add row
            </ThemedText>
          </TouchableOpacity>
        </View>

        {draftItems.length === 0 ? (
          <ThemedText style={[splitStyles.emptyText, { color: iconColor }]}>
            Add at least one rule row for correction.
          </ThemedText>
        ) : (
          draftItems.map((item) => (
            <View key={item.id} style={splitStyles.correctionRow}>
              <View style={splitStyles.correctionNameCol}>
                <Input
                  label="Rule"
                  value={item.name}
                  onChangeText={(value) => onUpdateDraftName(item.id, value)}
                  editable={!submitting}
                  placeholder="Rent"
                  autoCapitalize="words"
                />
              </View>

              <View style={splitStyles.correctionValueCol}>
                <Input
                  label="%"
                  value={item.value}
                  onChangeText={(value) => onUpdateDraftValue(item.id, value)}
                  editable={!submitting}
                  placeholder="20"
                  keyboardType="decimal-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.76}
                onPress={() => onRemoveDraftItem(item.id)}
                disabled={submitting}
                style={[
                  splitStyles.correctionDeleteButton,
                  { opacity: submitting ? 0.5 : 1 },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color="rgba(239,68,68,0.95)"
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={splitStyles.correctionSummaryRow}>
        <ThemedText style={[splitStyles.summaryHint, { color: iconColor }]}>
          Correction Total
        </ThemedText>
        <ThemedText style={splitStyles.summaryValue}>
          {formatPct(correctionTotal)}
        </ThemedText>
      </View>

      <Button
        onPress={onApplyCorrection}
        loading={submitting}
        disabled={submitting}
        leftIcon="git-branch-outline"
      >
        Apply Historical Correction
      </Button>

      {feedback ? (
        <View
          style={[
            splitStyles.feedbackCard,
            {
              borderColor:
                feedback.type === "success"
                  ? `${tint}55`
                  : "rgba(239,68,68,0.5)",
              backgroundColor:
                feedback.type === "success"
                  ? `${tint}1A`
                  : "rgba(239,68,68,0.12)",
            },
          ]}
        >
          <ThemedText style={splitStyles.feedbackText}>
            {feedback.text}
          </ThemedText>
        </View>
      ) : null}
    </Card>
  );
}
