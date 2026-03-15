import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Input } from "@/components/ui/input";
import { ThemedText } from "@/components/themed-text";
import useSplitRulesStyles from "./split-rules-stylesheet";
import type { DraftBreakdownItem } from "./split-correction-payload";

type SplitCorrectionBreakdownEditorProps = {
  draftItems: DraftBreakdownItem[];
  submitting: boolean;
  iconColor: string;
  onAddDraftItem: () => void;
  onRemoveDraftItem: (id: string) => void;
  onUpdateDraftName: (id: string, value: string) => void;
  onUpdateDraftValue: (id: string, value: string) => void;
};

export function SplitCorrectionBreakdownEditor({
  draftItems,
  submitting,
  iconColor,
  onAddDraftItem,
  onRemoveDraftItem,
  onUpdateDraftName,
  onUpdateDraftValue,
}: SplitCorrectionBreakdownEditorProps) {
  const splitStyles = useSplitRulesStyles();

  return (
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
  );
}
