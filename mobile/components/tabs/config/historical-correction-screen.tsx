import React, { useCallback } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { Loading } from "@/components/ui/loading";
import { ThemedText } from "@/components/themed-text";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthContext } from "@/lib/context/auth-context";

import useSplitRulesStyles from "./split-rules-stylesheet";
import { SplitCorrectionCard } from "./split-correction-card";
import { SplitCorrectionHistoryCard } from "./split-correction-history-card";
import { useSplitRules } from "./use-split-rules";
import { useSplitCorrection } from "./use-split-correction";
import { useSplitCorrectionHistory } from "./use-split-correction-history";

export function HistoricalCorrectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabsStyles = useTabsStyles();
  const splitStyles = useSplitRulesStyles();
  const { user, loading: authLoading } = useAuthContext();

  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");

  const { rules, loadingRules, refreshing, refreshRules } = useSplitRules(
    user?.id,
  );

  const {
    entries: correctionHistory,
    loading: loadingCorrectionHistory,
    refreshing: refreshingCorrectionHistory,
    error: correctionHistoryError,
    refresh: refreshCorrectionHistory,
  } = useSplitCorrectionHistory(user?.id);

  const refreshAll = useCallback(() => {
    refreshRules();
    refreshCorrectionHistory();
  }, [refreshCorrectionHistory, refreshRules]);

  const {
    startAtDate,
    endAtDate,
    reasonInput,
    draftItems,
    correctionTotal,
    submitting,
    feedback: correctionFeedback,
    setStartAtDate,
    setEndAtDate,
    clearEndAtDate,
    setReasonInput,
    addDraftItem,
    removeDraftItem,
    updateDraftName,
    updateDraftValue,
    applyCorrection,
  } = useSplitCorrection(user?.id, rules, refreshAll);

  const handleApplyCorrection = useCallback(async () => {
    const result = await applyCorrection(false);

    if (result.status !== "needs-confirmation") {
      return;
    }

    Alert.alert(
      "Apply open-ended correction?",
      "No end date selected. This will also update your current split rules.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Apply correction",
          style: "destructive",
          onPress: () => {
            void applyCorrection(true);
          },
        },
      ],
    );
  }, [applyCorrection]);

  if (authLoading) {
    return (
      <ThemedView style={tabsStyles.container}>
        <Loading message="Loading correction tools..." />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={tabsStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || refreshingCorrectionHistory}
            onRefresh={refreshAll}
          />
        }
        contentContainerStyle={[
          tabsStyles.scroll,
          splitStyles.scroll,
          { paddingTop: insets.top + 24 },
        ]}
      >
        <View style={splitStyles.headerWrap}>
          <View style={[tabsStyles.headerRow, splitStyles.headerRow]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={[
                tabsStyles.centerContent,
                splitStyles.logoCircle,
                { backgroundColor: `${tint}14` },
              ]}
            >
              <Ionicons name="arrow-back" size={20} color={tint} />
            </TouchableOpacity>
            <View style={splitStyles.headerTextWrap}>
              <ThemedText type="title" style={tabsStyles.title}>
                Historical Correction
              </ThemedText>
              <ThemedText style={[splitStyles.subtitle, { color: iconColor }]}>
                Adjust split timeline for past periods
              </ThemedText>
            </View>
          </View>
        </View>

        <SplitCorrectionCard
          startAtDate={startAtDate}
          endAtDate={endAtDate}
          reasonInput={reasonInput}
          draftItems={draftItems}
          correctionTotal={correctionTotal}
          submitting={submitting || loadingRules}
          feedback={correctionFeedback}
          tint={tint}
          iconColor={iconColor}
          onSetStartAtDate={setStartAtDate}
          onSetEndAtDate={setEndAtDate}
          onClearEndAtDate={clearEndAtDate}
          onSetReasonInput={setReasonInput}
          onAddDraftItem={addDraftItem}
          onRemoveDraftItem={removeDraftItem}
          onUpdateDraftName={updateDraftName}
          onUpdateDraftValue={updateDraftValue}
          onApplyCorrection={() => {
            void handleApplyCorrection();
          }}
        />

        <SplitCorrectionHistoryCard
          entries={correctionHistory}
          loading={loadingCorrectionHistory}
          error={correctionHistoryError}
          iconColor={iconColor}
        />
      </ScrollView>
    </ThemedView>
  );
}
