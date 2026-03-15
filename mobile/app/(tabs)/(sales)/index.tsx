import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { API_ENDPOINTS } from "@/constants/api";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthContext } from "@/lib/context/auth-context";
import { authenticatedFetch } from "@/lib/utils/auth-fetch";
import {
  SalesHeader,
  SalesHistoryCard,
  SalesKpiGrid,
  SalesRangePresets,
  SalesSplitImpactCard,
  SalesTrendCard,
  useSalesAnalytics,
} from "@/components/tabs/sales";
import {
  buildSalesCsvFileName,
  buildSalesCsvForLocalRange,
  type SplitHistoryTimelineRow,
} from "@/components/tabs/sales/csv-export";
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
    rangeStartDate,
    rangeEndDate,
    salesRows,
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
  const [downloadingCsv, setDownloadingCsv] = useState(false);

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

  const handleDownloadCsv = useCallback(async () => {
    if (!user?.id || downloadingCsv) return;

    try {
      setDownloadingCsv(true);

      const splitTimelineResponse = await authenticatedFetch<{
        timeline?: SplitHistoryTimelineRow[];
      }>(API_ENDPOINTS.SPLIT.HISTORY_TIMELINE_BY_USER(user.id), {
        method: "GET",
      });

      const splitHistoryRows = Array.isArray(splitTimelineResponse.timeline)
        ? splitTimelineResponse.timeline
        : [];

      const csv = buildSalesCsvForLocalRange({
        salesRows,
        splitHistoryRows,
        rangeStartDate,
        rangeEndDate,
      });

      if (!csv.trim()) {
        throw new Error("No CSV data available for this range.");
      }

      const fileName = buildSalesCsvFileName({
        salesRows,
        rangeStartDate,
        rangeEndDate,
        rangeLabel,
      });

      if (Platform.OS === "android") {
        const permission =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permission.granted) {
          const targetUri =
            await FileSystem.StorageAccessFramework.createFileAsync(
              permission.directoryUri,
              fileName,
              "text/csv",
            );

          await FileSystem.writeAsStringAsync(targetUri, csv, {
            encoding: FileSystem.EncodingType.UTF8,
          });

          Alert.alert("CSV downloaded", "Saved to the folder you selected.");
          return;
        }
      }

      const targetDirectory =
        FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

      if (!targetDirectory) {
        throw new Error("Could not access local file storage for export.");
      }

      const downloadsDirectory = `${targetDirectory}downloads/`;
      const downloadsDirectoryInfo =
        await FileSystem.getInfoAsync(downloadsDirectory);

      if (!downloadsDirectoryInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadsDirectory, {
          intermediates: true,
        });
      }

      const fileUri = `${downloadsDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert("CSV downloaded", "Saved to app files for this device.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not download CSV.";
      Alert.alert("Download failed", message);
    } finally {
      setDownloadingCsv(false);
    }
  }, [
    downloadingCsv,
    rangeEndDate,
    rangeLabel,
    rangeStartDate,
    salesRows,
    user?.id,
  ]);

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

          <Button
            variant="outline"
            size="small"
            leftIcon="download-outline"
            loading={downloadingCsv}
            onPress={() => {
              void handleDownloadCsv();
            }}
            style={salesStyles.exportButton}
          >
            Download CSV
          </Button>

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
