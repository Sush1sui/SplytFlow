import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui";
import { ThemedText } from "@/components/themed-text";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import useSplitRulesStyles from "./split-rules-stylesheet";
import { formatPct } from "./split-rules-utils";
import type { SplitRule } from "./types";

type SplitRulesListCardProps = {
  rules: SplitRule[];
  loading: boolean;
  iconColor: string;
  deletingName: string | null;
  deletingAll: boolean;
  onEdit: (rule: SplitRule) => void;
  onDelete: (name: string) => void;
  onDeleteAll: () => void;
};

export function SplitRulesListCard({
  rules,
  loading,
  iconColor,
  deletingName,
  deletingAll,
  onEdit,
  onDelete,
  onDeleteAll,
}: SplitRulesListCardProps) {
  const tabsStyles = useTabsStyles();
  const splitStyles = useSplitRulesStyles();

  return (
    <Card style={splitStyles.listCard}>
      <View style={splitStyles.listHeaderRow}>
        <ThemedText style={splitStyles.listTitle}>Current Rules</ThemedText>
        <TouchableOpacity
          activeOpacity={0.76}
          onPress={onDeleteAll}
          disabled={loading || deletingAll || rules.length === 0}
          style={[
            splitStyles.actionChip,
            splitStyles.deleteAllChip,
            {
              opacity: loading || deletingAll || rules.length === 0 ? 0.45 : 1,
            },
          ]}
        >
          <Ionicons
            name="trash-bin-outline"
            size={14}
            color="rgba(239,68,68,0.95)"
          />
          <ThemedText
            style={[splitStyles.actionText, { color: "rgba(239,68,68,0.95)" }]}
          >
            {deletingAll ? "Deleting all" : "Delete all"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <View key={`split-rule-skeleton-${index}`}>
            <View style={splitStyles.ruleRow}>
              <View style={splitStyles.ruleLeft}>
                <Skeleton width={98} height={14} borderRadius={7} />
                <View style={{ height: 6 }} />
                <Skeleton width={56} height={12} borderRadius={6} />
              </View>
              <View style={splitStyles.ruleRight}>
                <Skeleton width={56} height={26} borderRadius={999} />
                <Skeleton width={72} height={26} borderRadius={999} />
              </View>
            </View>
            {index < 2 ? <View style={tabsStyles.divider} /> : null}
          </View>
        ))
      ) : rules.length === 0 ? (
        <View style={splitStyles.emptyWrap}>
          <ThemedText style={[splitStyles.emptyText, { color: iconColor }]}>
            No split rules yet. Add your first rule above.
          </ThemedText>
        </View>
      ) : (
        rules.map((rule, index) => (
          <View key={rule.id}>
            <View style={splitStyles.ruleRow}>
              <View style={splitStyles.ruleLeft}>
                <ThemedText style={splitStyles.ruleName}>
                  {rule.name}
                </ThemedText>
                <ThemedText
                  style={[splitStyles.ruleValue, { color: iconColor }]}
                >
                  {formatPct(rule.value)}
                </ThemedText>
              </View>

              <View style={splitStyles.ruleRight}>
                <TouchableOpacity
                  activeOpacity={0.76}
                  onPress={() => onEdit(rule)}
                  style={[
                    splitStyles.actionChip,
                    {
                      borderColor: `${iconColor}32`,
                      backgroundColor: `${iconColor}0D`,
                    },
                  ]}
                >
                  <Ionicons name="create-outline" size={14} color={iconColor} />
                  <ThemedText
                    style={[splitStyles.actionText, { color: iconColor }]}
                  >
                    Edit
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.76}
                  onPress={() => onDelete(rule.name)}
                  disabled={deletingName === rule.name}
                  style={[
                    splitStyles.actionChip,
                    {
                      borderColor: "rgba(239,68,68,0.38)",
                      backgroundColor: "rgba(239,68,68,0.1)",
                      opacity: deletingName === rule.name ? 0.6 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={14}
                    color="rgba(239,68,68,0.95)"
                  />
                  <ThemedText
                    style={[
                      splitStyles.actionText,
                      { color: "rgba(239,68,68,0.95)" },
                    ]}
                  >
                    {deletingName === rule.name ? "Deleting" : "Delete"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            {index < rules.length - 1 ? (
              <View style={tabsStyles.divider} />
            ) : null}
          </View>
        ))
      )}
    </Card>
  );
}
