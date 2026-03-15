import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import useSplitRulesStyles from "./split-rules-stylesheet";

type SplitRulesHeaderProps = {
  tint: string;
  iconColor: string;
};

export function SplitRulesHeader({ tint, iconColor }: SplitRulesHeaderProps) {
  const tabsStyles = useTabsStyles();
  const splitStyles = useSplitRulesStyles();

  return (
    <View style={splitStyles.headerWrap}>
      <View style={[tabsStyles.headerRow, splitStyles.headerRow]}>
        <View
          style={[
            tabsStyles.centerContent,
            splitStyles.logoCircle,
            { backgroundColor: `${tint}14` },
          ]}
        >
          <Ionicons name="git-branch-outline" size={24} color={tint} />
        </View>

        <View style={splitStyles.headerTextWrap}>
          <ThemedText type="title" style={tabsStyles.title}>
            Split Rules
          </ThemedText>
          <ThemedText style={[splitStyles.subtitle, { color: iconColor }]}>
            Manage how deductions are distributed
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
