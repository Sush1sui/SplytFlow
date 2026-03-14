import React, { memo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import useSalesStyles from "@/app/(tabs)/(sales)/sales-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";

import { colorWithOpacity } from "./colors";

type SalesHeaderProps = {
  rangeLabel: string;
  onManagePress?: () => void;
};

function SalesHeaderComponent({ rangeLabel, onManagePress }: SalesHeaderProps) {
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const tabsStyles = useTabsStyles();
  const salesStyles = useSalesStyles();
  const tintSoft = colorWithOpacity(tint, 0.1);
  const actionBorder = colorWithOpacity(iconColor, 0.28);
  const actionBg = colorWithOpacity(tint, 0.12);

  return (
    <View style={salesStyles.headerWrap}>
      <View style={salesStyles.headerMainRow}>
        <View style={[tabsStyles.headerRow, salesStyles.headerRow]}>
          <View
            style={[
              tabsStyles.centerContent,
              salesStyles.logoCircle,
              { backgroundColor: tintSoft },
            ]}
          >
            <Ionicons name="stats-chart-outline" size={24} color={tint} />
          </View>
          <View style={salesStyles.headerTextWrap}>
            <ThemedText type="title" style={tabsStyles.title}>
              Sales Analytics
            </ThemedText>
            <ThemedText style={[salesStyles.subtitle, { color: iconColor }]}>
              {rangeLabel}
            </ThemedText>
          </View>
        </View>

        {onManagePress ? (
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={onManagePress}
            style={[
              salesStyles.headerManageButton,
              { borderColor: actionBorder, backgroundColor: actionBg },
            ]}
          >
            <Ionicons name="create-outline" size={14} color={tint} />
            <ThemedText style={[salesStyles.headerManageText, { color: tint }]}>
              Manage
            </ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export const SalesHeader = memo(SalesHeaderComponent);
