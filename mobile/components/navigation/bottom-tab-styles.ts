import { StyleSheet, useWindowDimensions } from "react-native";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function useBottomTabStyles() {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const iconSize = isTablet ? 28 : 24;
  const labelSize = isTablet ? 12 : 10;
  const verticalPadding = isTablet ? 16 : 12;
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        tabBar: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          paddingBottom: insets.bottom + verticalPadding,
          paddingTop: verticalPadding,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabItem: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
        icon: {
          // icon style placeholder in case we need it later
        },
        label: {
          marginTop: 2,
          fontSize: labelSize,
        },
      }),
    // only recompute when device size or safe-area changes
    [insets.bottom, verticalPadding, labelSize],
  );

  return { styles, iconSize };
}
