import React, { memo, useMemo } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import useSalesStyles from "@/app/(tabs)/(sales)/sales-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";

import { SALES_PRESETS } from "./date-range";
import { colorWithOpacity } from "./colors";
import type { SalesPreset } from "./types";

type SalesRangePresetsProps = {
  value: SalesPreset;
  onChange: (value: SalesPreset) => void;
};

function SalesRangePresetsComponent({
  value,
  onChange,
}: SalesRangePresetsProps) {
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const salesStyles = useSalesStyles();
  const { width } = useWindowDimensions();
  const isVerySmall = width < 360;
  const activeBorder = colorWithOpacity(tint, 0.66);
  const activeBg = colorWithOpacity(tint, 0.14);
  const inactiveBorder = colorWithOpacity(iconColor, 0.27);

  const visiblePresets = useMemo(() => {
    if (!isVerySmall || value === "all") {
      return SALES_PRESETS;
    }

    return SALES_PRESETS.filter((preset) => preset.key !== "all");
  }, [isVerySmall, value]);

  const showAllShortcut = isVerySmall && value !== "all";

  return (
    <View style={salesStyles.presetSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={salesStyles.presetRow}
      >
        {visiblePresets.map((preset) => {
          const selected = preset.key === value;

          return (
            <TouchableOpacity
              key={preset.key}
              activeOpacity={0.8}
              onPress={() => onChange(preset.key)}
              style={[
                salesStyles.presetChip,
                selected && salesStyles.presetChipSelected,
                {
                  borderColor: selected ? activeBorder : inactiveBorder,
                  backgroundColor: selected ? activeBg : "transparent",
                },
              ]}
            >
              <ThemedText
                style={[
                  salesStyles.presetChipLabel,
                  selected && salesStyles.presetChipLabelSelected,
                  { color: selected ? tint : iconColor },
                ]}
              >
                {preset.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}

        {showAllShortcut ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onChange("all")}
            style={[
              salesStyles.presetChip,
              salesStyles.presetChipCollapsed,
              {
                borderColor: inactiveBorder,
                backgroundColor: "transparent",
              },
            ]}
          >
            <ThemedText
              style={[salesStyles.presetChipLabel, { color: iconColor }]}
            >
              ...
            </ThemedText>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

export const SalesRangePresets = memo(SalesRangePresetsComponent);
