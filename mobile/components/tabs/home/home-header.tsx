import React, { memo } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { capitalizeFirstLetter } from "@/lib/utils";
import useHomeStyles from "@/app/(tabs)/home-stylesheet";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";

type HomeHeaderProps = {
  firstName?: string | null;
};

function HomeHeaderComponent({ firstName }: HomeHeaderProps) {
  const tint = useThemeColor({}, "tint");
  const homeStyles = useHomeStyles();
  const tabsStyles = useTabsStyles();

  return (
    <View style={[tabsStyles.headerRow, homeStyles.header]}>
      <View
        style={[
          tabsStyles.centerContent,
          homeStyles.logoCircle,
          { backgroundColor: `${tint}18` },
        ]}
      >
        <Ionicons name="flash" size={30} color={tint} />
      </View>
      <View style={homeStyles.headerText}>
        <ThemedText style={homeStyles.greeting}>
          Welcome back {firstName ? capitalizeFirstLetter(firstName) : null}👋
        </ThemedText>
        <ThemedText type="title" style={[tabsStyles.title, homeStyles.title]}>
          Dashboard
        </ThemedText>
      </View>
    </View>
  );
}

export const HomeHeader = memo(HomeHeaderComponent);
