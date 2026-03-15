import React from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemedText } from "@/components/themed-text";
import type { SplitFeedback } from "./types";
import useSplitRulesStyles from "./split-rules-stylesheet";

type SplitRulesFormCardProps = {
  editingName: string | null;
  nameInput: string;
  valueInput: string;
  nameError?: string;
  valueError?: string;
  saving: boolean;
  deletingAll: boolean;
  feedback: SplitFeedback;
  tint: string;
  setNameInput: (value: string) => void;
  setValueInput: (value: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
};

export function SplitRulesFormCard({
  editingName,
  nameInput,
  valueInput,
  nameError,
  valueError,
  saving,
  deletingAll,
  feedback,
  tint,
  setNameInput,
  setValueInput,
  onSave,
  onCancelEdit,
}: SplitRulesFormCardProps) {
  const splitStyles = useSplitRulesStyles();
  const isBusy = saving || deletingAll;

  return (
    <Card style={splitStyles.formCard}>
      <ThemedText style={splitStyles.formTitle}>
        {editingName ? "Update Rule" : "Add Rule"}
      </ThemedText>

      <Input
        label="Rule Name"
        value={nameInput}
        onChangeText={setNameInput}
        error={nameError}
        placeholder="Example: Rent"
        editable={!isBusy && !editingName}
        helperText={
          editingName ? "Rule name is locked during edit." : undefined
        }
      />

      <Input
        label="Percentage"
        value={valueInput}
        onChangeText={setValueInput}
        error={valueError}
        keyboardType="decimal-pad"
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="0.0"
        editable={!isBusy}
        helperText="Use values greater than 0 and up to 100."
      />

      <View style={splitStyles.actionsRow}>
        <Button
          onPress={onSave}
          loading={saving}
          disabled={isBusy}
          leftIcon="save-outline"
          fullWidth={false}
        >
          {editingName ? "Update" : "Add Rule"}
        </Button>

        {editingName ? (
          <Button
            variant="outline"
            onPress={onCancelEdit}
            disabled={isBusy}
            leftIcon="close-outline"
            fullWidth={false}
          >
            Cancel
          </Button>
        ) : null}
      </View>

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
