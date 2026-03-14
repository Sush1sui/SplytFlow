import React, { useEffect, useRef } from "react";
import { Animated, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/lib/context/auth-context";
import { Loading } from "@/components/ui/loading";
import {
  HomeHeader,
  TodaySalesStats,
  QuickAddSalesCard,
  RecentSalesCard,
  useHomeSales,
} from "@/components/tabs/home";
import useTabsStyles from "./tabs-stylesheet";
import useHomeStyles from "./home-stylesheet";

export default function Home() {
  const { user, loading } = useAuthContext();

  const {
    todayTotalSales,
    todayNetSales,
    recentSales,
    todaySalesLoading,
    removingSaleId,
    clearingRecentLogs,
    addQuickSale,
    clearRecentSales,
    removeRecentSale,
  } = useHomeSales(user?.id);

  const insets = useSafeAreaInsets();
  const tabsStyles = useTabsStyles();
  const homeStyles = useHomeStyles();

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

  if (loading) {
    return (
      <ThemedView style={tabsStyles.container}>
        <Loading message="Loading..." />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={tabsStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          tabsStyles.scroll,
          homeStyles.scroll,
          { paddingTop: insets.top + 24 },
        ]}
      >
        {/* Header */}
        <Animated.View style={[animStyle(headerAnim)]}>
          <HomeHeader firstName={user?.firstName} />
        </Animated.View>

        <Animated.View style={animStyle(statsAnim)}>
          <TodaySalesStats
            totalSales={todayTotalSales}
            netSales={todayNetSales}
            loading={todaySalesLoading}
          />
        </Animated.View>

        <Animated.View style={animStyle(actionsAnim)}>
          <QuickAddSalesCard onSubmit={addQuickSale} />
        </Animated.View>

        <RecentSalesCard
          sales={recentSales}
          loading={todaySalesLoading}
          clearingLogs={clearingRecentLogs}
          removingLogId={removingSaleId}
          onClearLogs={clearRecentSales}
          onRemoveLog={removeRecentSale}
        />
      </ScrollView>
    </ThemedView>
  );
}
