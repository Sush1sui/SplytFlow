import React, { useCallback, useEffect, useRef } from "react";
import { Animated, RefreshControl, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthContext } from "@/lib/context/auth-context";
import {
  SalesHeader,
  SalesHistoryCard,
  SalesKpiGrid,
  SalesRangePresets,
  SalesSplitImpactCard,
  SalesTrendCard,
  useSalesAnalytics,
} from "@/components/tabs/sales";
import { ThemedText } from "@/components/themed-text";
import useTabsStyles from "../tabs-stylesheet";
import useSalesStyles from "./sales-stylesheet";

export default function SalesIndex() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const insets = useSafeAreaInsets();
  const iconColor = useThemeColor({}, "icon");

  const {
    preset,
    setPreset,
    rangeLabel,
    loading,
    refreshing,
    errorText,
    grossSales,
    netSales,
    deductions,
    saleCount,
    avgSalesPerDay,
    avgSalesPerActiveDay,
    totalSplitPct,
    retainedPct,
    trendPoints,
    historyRows,
    topSplits,
    splitTimelineRows,
    refresh,
    refreshIfStale,
  } = useSalesAnalytics(user?.id);

  const tabsStyles = useTabsStyles();
  const salesStyles = useSalesStyles();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const controlsAnim = useRef(new Animated.Value(0)).current;
  const metricsAnim = useRef(new Animated.Value(0)).current;
  const detailsAnim = useRef(new Animated.Value(0)).current;
  const hasFocusedOnceRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      if (!hasFocusedOnceRef.current) {
        hasFocusedOnceRef.current = true;
        return;
      }
      void refreshIfStale();
    }, [refreshIfStale, user?.id]),
  );

  useEffect(() => {
    Animated.stagger(90, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(controlsAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(metricsAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(detailsAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [controlsAnim, detailsAnim, headerAnim, metricsAnim]);

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

  if (authLoading) {
    return (
      <ThemedView style={tabsStyles.container}>
        <Loading message="Loading analytics..." />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={tabsStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
          />
        }
        contentContainerStyle={[
          tabsStyles.scroll,
          salesStyles.scroll,
          { paddingTop: insets.top + 24 },
        ]}
      >
        <Animated.View style={animStyle(headerAnim)}>
          <SalesHeader
            rangeLabel={rangeLabel}
            onManagePress={() => router.push("/(tabs)/(sales)/manage")}
          />
        </Animated.View>

        <Animated.View style={animStyle(controlsAnim)}>
          <SalesRangePresets value={preset} onChange={setPreset} />

          {errorText ? (
            <Card style={salesStyles.errorCard}>
              <ThemedText style={[salesStyles.errorText, { color: iconColor }]}>
                {errorText}
              </ThemedText>
            </Card>
          ) : null}
        </Animated.View>

        <Animated.View style={animStyle(metricsAnim)}>
          <SalesKpiGrid
            loading={loading}
            grossSales={grossSales}
            netSales={netSales}
            avgSalesPerDay={avgSalesPerDay}
            avgSalesPerActiveDay={avgSalesPerActiveDay}
            saleCount={saleCount}
          />
          <SalesTrendCard loading={loading} points={trendPoints} />
        </Animated.View>

        <Animated.View style={animStyle(detailsAnim)}>
          <SalesSplitImpactCard
            loading={loading}
            totalSplitPct={totalSplitPct}
            retainedPct={retainedPct}
            deductions={deductions}
            topSplits={topSplits}
            splitTimelineRows={splitTimelineRows}
          />
          <SalesHistoryCard loading={loading} rows={historyRows} />
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}
