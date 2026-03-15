import React from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/card";
import { ThemedText } from "@/components/themed-text";
import useSplitRulesStyles from "./split-rules-stylesheet";
import { formatPct } from "./split-rules-utils";

type SplitRulesSummaryCardProps = {
  totalSplitPct: number;
  retainedPct: number;
  tint: string;
  iconColor: string;
};

export function SplitRulesSummaryCard({
  totalSplitPct,
  retainedPct,
  tint,
  iconColor,
}: SplitRulesSummaryCardProps) {
  const splitStyles = useSplitRulesStyles();

  return (
    <Card style={splitStyles.summaryCard}>
      <View style={splitStyles.summaryGrid}>
        <View
          style={[
            splitStyles.summaryBox,
            {
              borderColor: `${iconColor}30`,
              backgroundColor: `${iconColor}0F`,
            },
          ]}
        >
          <ThemedText style={[splitStyles.summaryLabel, { color: iconColor }]}>
            Total Split
          </ThemedText>
          <ThemedText style={splitStyles.summaryValue}>
            {formatPct(totalSplitPct)}
          </ThemedText>
        </View>

        <View
          style={[
            splitStyles.summaryBox,
            { borderColor: `${iconColor}30`, backgroundColor: `${tint}10` },
          ]}
        >
          <ThemedText style={[splitStyles.summaryLabel, { color: iconColor }]}>
            You Keep
          </ThemedText>
          <ThemedText style={splitStyles.summaryValue}>
            {formatPct(retainedPct)}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={[splitStyles.summaryHint, { color: iconColor }]}>
        Total split percentage must stay at or below 100%.
      </ThemedText>
    </Card>
  );
}
