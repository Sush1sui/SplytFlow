import React, { useRef, useEffect } from "react";
import { ScrollView, View, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { useThemeColor } from "@/hooks/use-theme-color";
import useTabsStyles from "../tabs-stylesheet";
import useConfigStyles from "./config-stylesheet";

// ─── Module-level: defined outside parent so React never remounts it ──────────
function ConfigRow({
  icon,
  label,
  last = false,
  right,
  tint,
  iconColor,
  tabsStyles,
  configStyles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  last?: boolean;
  right?: React.ReactNode;
  tint: string;
  iconColor: string;
  tabsStyles: ReturnType<typeof useTabsStyles>;
  configStyles: ReturnType<typeof useConfigStyles>;
}) {
  return (
    <>
      <View style={tabsStyles.rowItem}>
        <View
          style={[
            tabsStyles.centerContent,
            configStyles.configIconWrap,
            { backgroundColor: `${tint}18` },
          ]}
        >
          <Ionicons name={icon} size={18} color={tint} />
        </View>
        <ThemedText style={configStyles.configLabel}>{label}</ThemedText>
        {right ?? (
          <Ionicons name="chevron-forward" size={16} color={iconColor} />
        )}
      </View>
      {!last && <View style={tabsStyles.divider} />}
    </>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

export default function ConfigIndex() {
  const insets = useSafeAreaInsets();
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const tabsStyles = useTabsStyles();
  const configStyles = useConfigStyles();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const section1Anim = useRef(new Animated.Value(0)).current;
  const section2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(90, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(section1Anim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(section2Anim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnim, section1Anim, section2Anim]);

  const animStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  });

  // thin helper so call sites stay readable
  const row = (
    props: Omit<
      Parameters<typeof ConfigRow>[0],
      "tint" | "iconColor" | "tabsStyles" | "configStyles"
    >,
  ) => (
    <ConfigRow
      {...props}
      tint={tint}
      iconColor={iconColor}
      tabsStyles={tabsStyles}
      configStyles={configStyles}
    />
  );

  return (
    <ThemedView style={tabsStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          tabsStyles.scroll,
          configStyles.scroll,
          { paddingTop: insets.top + 24 },
        ]}
      >
        {/* Header */}
        <Animated.View
          style={[
            tabsStyles.headerRow,
            configStyles.header,
            animStyle(headerAnim),
          ]}
        >
          <View
            style={[
              tabsStyles.centerContent,
              configStyles.logoCircle,
              { backgroundColor: `${tint}18` },
            ]}
          >
            <Ionicons name="construct-outline" size={28} color={tint} />
          </View>
          <ThemedText type="title" style={tabsStyles.title}>
            Config
          </ThemedText>
        </Animated.View>

        {/* Business settings */}
        <Animated.View style={animStyle(section1Anim)}>
          <ThemedText style={[tabsStyles.sectionTitle, { color: iconColor }]}>
            BUSINESS
          </ThemedText>
          <Card>
            {row({ icon: "storefront-outline", label: "Store Details" })}
            {row({ icon: "pricetag-outline", label: "Categories" })}
            {row({ icon: "people-outline", label: "Team Members", last: true })}
          </Card>
        </Animated.View>

        {/* Sale settings */}
        <Animated.View style={animStyle(section2Anim)}>
          <ThemedText style={[tabsStyles.sectionTitle, { color: iconColor }]}>
            SALES
          </ThemedText>
          <Card>
            {row({ icon: "cash-outline", label: "Payment Methods" })}
            {row({ icon: "git-branch-outline", label: "Split Rules" })}
            {row({ icon: "receipt-outline", label: "Tax & Fees", last: true })}
          </Card>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}
