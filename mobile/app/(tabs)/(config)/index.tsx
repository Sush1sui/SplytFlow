import React, { useRef, useEffect } from "react";
import { ScrollView, View, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { useThemeColor } from "@/hooks/use-theme-color";

// ─── Module-level: defined outside parent so React never remounts it ──────────
function ConfigRow({
  icon,
  label,
  last = false,
  right,
  tint,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  last?: boolean;
  right?: React.ReactNode;
  tint: string;
  iconColor: string;
}) {
  return (
    <>
      <View style={styles.configRow}>
        <View style={[styles.configIconWrap, { backgroundColor: `${tint}18` }]}>
          <Ionicons name={icon} size={18} color={tint} />
        </View>
        <ThemedText style={styles.configLabel}>{label}</ThemedText>
        {right ?? (
          <Ionicons name="chevron-forward" size={16} color={iconColor} />
        )}
      </View>
      {!last && <View style={styles.divider} />}
    </>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

export default function ConfigIndex() {
  const insets = useSafeAreaInsets();
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");

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
  }, []);

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
    props: Omit<Parameters<typeof ConfigRow>[0], "tint" | "iconColor">,
  ) => <ConfigRow {...props} tint={tint} iconColor={iconColor} />;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24 }]}
      >
        {/* Header */}
        <Animated.View style={[styles.header, animStyle(headerAnim)]}>
          <View style={[styles.logoCircle, { backgroundColor: `${tint}18` }]}>
            <Ionicons name="construct-outline" size={28} color={tint} />
          </View>
          <ThemedText type="title" style={styles.title}>
            Config
          </ThemedText>
        </Animated.View>

        {/* Business settings */}
        <Animated.View style={animStyle(section1Anim)}>
          <ThemedText style={[styles.sectionTitle, { color: iconColor }]}>
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
          <ThemedText style={[styles.sectionTitle, { color: iconColor }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 32, gap: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 8,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 26, fontWeight: "700" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  configRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  configIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  configLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  divider: {
    height: 1,
    backgroundColor: "rgba(150,150,150,0.12)",
    marginVertical: 10,
  },
});
