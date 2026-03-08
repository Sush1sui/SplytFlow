import React, { useRef, useEffect } from "react";
import { ScrollView, View, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { useThemeColor } from "@/hooks/use-theme-color";

const SUMMARY = [
  {
    label: "Revenue",
    value: "—",
    icon: "trending-up-outline" as const,
    positive: true,
  },
  {
    label: "Orders",
    value: "—",
    icon: "receipt-outline" as const,
    positive: true,
  },
];

const RECENT = [
  {
    name: "No sales yet",
    amount: "—",
    date: "—",
    icon: "cart-outline" as const,
  },
];

export default function SalesIndex() {
  const insets = useSafeAreaInsets();
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");

  const headerAnim = useRef(new Animated.Value(0)).current;
  const summaryAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(90, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(summaryAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(listAnim, {
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
            <Ionicons name="cash-outline" size={28} color={tint} />
          </View>
          <ThemedText type="title" style={styles.title}>
            Sales
          </ThemedText>
        </Animated.View>

        {/* Summary cards */}
        <Animated.View style={[styles.summaryRow, animStyle(summaryAnim)]}>
          {SUMMARY.map((s) => (
            <Card key={s.label} style={styles.summaryCard}>
              <View
                style={[
                  styles.summaryIconWrap,
                  { backgroundColor: `${tint}18` },
                ]}
              >
                <Ionicons name={s.icon} size={18} color={tint} />
              </View>
              <ThemedText style={styles.summaryValue}>{s.value}</ThemedText>
              <ThemedText style={[styles.summaryLabel, { color: iconColor }]}>
                {s.label}
              </ThemedText>
            </Card>
          ))}
        </Animated.View>

        {/* Recent sales */}
        <Animated.View style={animStyle(listAnim)}>
          <ThemedText style={[styles.sectionTitle, { color: iconColor }]}>
            RECENT SALES
          </ThemedText>
          <Card>
            {RECENT.map((item, idx) => (
              <View key={idx}>
                <View style={styles.saleItem}>
                  <View
                    style={[styles.saleIcon, { backgroundColor: `${tint}18` }]}
                  >
                    <Ionicons name={item.icon} size={18} color={tint} />
                  </View>
                  <View style={styles.saleInfo}>
                    <ThemedText style={styles.saleName}>{item.name}</ThemedText>
                    <ThemedText style={[styles.saleDate, { color: iconColor }]}>
                      {item.date}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.saleAmount, { color: tint }]}>
                    {item.amount}
                  </ThemedText>
                </View>
                {idx < RECENT.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 26, fontWeight: "700" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  summaryCard: { flex: 1, padding: 16, gap: 6 },
  summaryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryValue: { fontSize: 22, fontWeight: "700" },
  summaryLabel: { fontSize: 12 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  saleItem: { flexDirection: "row", alignItems: "center" },
  saleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  saleInfo: { flex: 1 },
  saleName: { fontSize: 14, fontWeight: "500" },
  saleDate: { fontSize: 12, marginTop: 2 },
  saleAmount: { fontSize: 15, fontWeight: "600" },
  divider: {
    height: 1,
    backgroundColor: "rgba(150,150,150,0.12)",
    marginVertical: 10,
  },
});
