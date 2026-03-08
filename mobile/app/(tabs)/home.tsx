import React, { useRef, useEffect } from "react";
import { ScrollView, View, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useThemeColor } from "@/hooks/use-theme-color";

const STATS = [
  { label: "Total Sales", value: "—", icon: "cash-outline" as const },
  { label: "Splits", value: "—", icon: "git-branch-outline" as const },
  { label: "Pending", value: "—", icon: "time-outline" as const },
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");

  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(90, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(statsAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(actionsAnim, {
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24 }]}
      >
        {/* Header */}
        <Animated.View style={[styles.header, animStyle(headerAnim)]}>
          <View style={[styles.logoCircle, { backgroundColor: `${tint}18` }]}>
            <Ionicons name="flash" size={30} color={tint} />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={styles.greeting}>Welcome back 👋</ThemedText>
            <ThemedText type="title" style={styles.title}>
              Dashboard
            </ThemedText>
          </View>
        </Animated.View>

        {/* Stats row */}
        <Animated.View style={[styles.statsRow, animStyle(statsAnim)]}>
          {STATS.map((stat) => (
            <Card key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon} size={20} color={tint} />
              <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: iconColor }]}>
                {stat.label}
              </ThemedText>
            </Card>
          ))}
        </Animated.View>

        {/* Quick actions */}
        <Animated.View style={animStyle(actionsAnim)}>
          <ThemedText style={[styles.sectionTitle, { color: iconColor }]}>
            QUICK ACTIONS
          </ThemedText>
          <Card>
            <View style={styles.actionItem}>
              <View
                style={[styles.actionIcon, { backgroundColor: `${tint}18` }]}
              >
                <Ionicons name="add-circle-outline" size={22} color={tint} />
              </View>
              <ThemedText style={styles.actionLabel}>New Sale</ThemedText>
              <Ionicons name="chevron-forward" size={18} color={iconColor} />
            </View>
            <View style={styles.divider} />
            <View style={styles.actionItem}>
              <View
                style={[styles.actionIcon, { backgroundColor: `${tint}18` }]}
              >
                <Ionicons name="git-branch-outline" size={22} color={tint} />
              </View>
              <ThemedText style={styles.actionLabel}>Split Bill</ThemedText>
              <Ionicons name="chevron-forward" size={18} color={iconColor} />
            </View>
            <View style={styles.divider} />
            <View style={styles.actionItem}>
              <View
                style={[styles.actionIcon, { backgroundColor: `${tint}18` }]}
              >
                <Ionicons name="bar-chart-outline" size={22} color={tint} />
              </View>
              <ThemedText style={styles.actionLabel}>View Reports</ThemedText>
              <Ionicons name="chevron-forward" size={18} color={iconColor} />
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 32 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 28 },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  headerText: { flex: 1 },
  greeting: { fontSize: 14, opacity: 0.6, marginBottom: 2 },
  title: { fontSize: 26, fontWeight: "700", lineHeight: 30 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  statCard: { flex: 1, padding: 14, alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontWeight: "700", marginTop: 6 },
  statLabel: { fontSize: 11, textAlign: "center" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  divider: {
    height: 1,
    backgroundColor: "rgba(150,150,150,0.12)",
    marginVertical: 10,
  },
});
