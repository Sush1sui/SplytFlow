import React, { useRef, useEffect } from "react";
import { ScrollView, View, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { useThemeColor } from "@/hooks/use-theme-color";
import useTabsStyles from "../tabs-stylesheet";
import useSalesStyles from "./sales-stylesheet";

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
  const tabsStyles = useTabsStyles();
  const salesStyles = useSalesStyles();

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
    <ThemedView style={tabsStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          tabsStyles.scroll,
          salesStyles.scroll,
          { paddingTop: insets.top + 24 },
        ]}
      >
        {/* Header */}
        <Animated.View
          style={[
            tabsStyles.headerRow,
            salesStyles.header,
            animStyle(headerAnim),
          ]}
        >
          <View
            style={[
              tabsStyles.centerContent,
              salesStyles.logoCircle,
              { backgroundColor: `${tint}18` },
            ]}
          >
            <Ionicons name="cash-outline" size={28} color={tint} />
          </View>
          <ThemedText type="title" style={tabsStyles.title}>
            Sales
          </ThemedText>
        </Animated.View>

        {/* Summary cards */}
        <Animated.View style={[salesStyles.summaryRow, animStyle(summaryAnim)]}>
          {SUMMARY.map((s) => (
            <Card key={s.label} style={salesStyles.summaryCard}>
              <View
                style={[
                  salesStyles.summaryIconWrap,
                  { backgroundColor: `${tint}18` },
                ]}
              >
                <Ionicons name={s.icon} size={18} color={tint} />
              </View>
              <ThemedText style={salesStyles.summaryValue}>
                {s.value}
              </ThemedText>
              <ThemedText
                style={[salesStyles.summaryLabel, { color: iconColor }]}
              >
                {s.label}
              </ThemedText>
            </Card>
          ))}
        </Animated.View>

        {/* Recent sales */}
        <Animated.View style={animStyle(listAnim)}>
          <ThemedText style={[tabsStyles.sectionTitle, { color: iconColor }]}>
            RECENT SALES
          </ThemedText>
          <Card>
            {RECENT.map((item, idx) => (
              <View key={idx}>
                <View style={salesStyles.saleItem}>
                  <View
                    style={[
                      salesStyles.saleIcon,
                      { backgroundColor: `${tint}18` },
                    ]}
                  >
                    <Ionicons name={item.icon} size={18} color={tint} />
                  </View>
                  <View style={salesStyles.saleInfo}>
                    <ThemedText style={salesStyles.saleName}>
                      {item.name}
                    </ThemedText>
                    <ThemedText
                      style={[salesStyles.saleDate, { color: iconColor }]}
                    >
                      {item.date}
                    </ThemedText>
                  </View>
                  <ThemedText style={[salesStyles.saleAmount, { color: tint }]}>
                    {item.amount}
                  </ThemedText>
                </View>
                {idx < RECENT.length - 1 && <View style={tabsStyles.divider} />}
              </View>
            ))}
          </Card>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}
