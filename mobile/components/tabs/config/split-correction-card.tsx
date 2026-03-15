import React from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemedText } from "@/components/themed-text";
import type { SplitFeedback } from "./types";
import { formatPct } from "./split-rules-utils";
import useSplitRulesStyles from "./split-rules-stylesheet";
import { SplitCorrectionDateWindow } from "./split-correction-date-window";
import { SplitCorrectionBreakdownEditor } from "./split-correction-breakdown-editor";
import type { DraftBreakdownItem } from "./split-correction-payload";

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

  return (
    <Card style={splitStyles.correctionCard}>
      <View style={splitStyles.correctionHeaderRow}>
        <ThemedText style={splitStyles.formTitle}>
          Historical Correction
        </ThemedText>
      </View>

      <SplitCorrectionDateWindow
        startAtDate={startAtDate}
        endAtDate={endAtDate}
        submitting={submitting}
        iconColor={iconColor}
        onSetStartAtDate={onSetStartAtDate}
        onSetEndAtDate={onSetEndAtDate}
        onClearEndAtDate={onClearEndAtDate}
      />

      <Input
        label="Reason (optional)"
        value={reasonInput}
        onChangeText={onSetReasonInput}
        editable={!submitting}
        placeholder="e.g. Rent should be 25%"
        autoCapitalize="sentences"
      />

      <SplitCorrectionBreakdownEditor
        draftItems={draftItems}
        submitting={submitting}
        iconColor={iconColor}
        onAddDraftItem={onAddDraftItem}
        onRemoveDraftItem={onRemoveDraftItem}
        onUpdateDraftName={onUpdateDraftName}
        onUpdateDraftValue={onUpdateDraftValue}
      />

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
