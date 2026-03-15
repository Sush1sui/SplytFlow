import React, { useCallback } from "react";
import { Alert, RefreshControl, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedView } from "@/components/themed-view";
import { Loading } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthContext } from "@/lib/context/auth-context";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";

import { SplitRulesFormCard } from "./split-rules-form-card";
import { SplitRulesHeader } from "./split-rules-header";
import { SplitRulesListCard } from "./split-rules-list-card";
import { SplitRulesSummaryCard } from "./split-rules-summary-card";
import useSplitRulesStyles from "./split-rules-stylesheet";
import { useSplitRules } from "./use-split-rules";

export function SplitRulesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabsStyles = useTabsStyles();
  const splitStyles = useSplitRulesStyles();
  const { user, loading: authLoading } = useAuthContext();

  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");

  const {
    rules,
    loadingRules,
    refreshing,
    saving,
    deletingName,
    deletingAll,
    editingName,
    nameInput,
    valueInput,
    nameError,
    valueError,
    feedback,
    totalSplitPct,
    retainedPct,
    setNameInput,
    setValueInput,
    refreshRules,
    startEditRule,
    resetForm,
    saveRule,
    deleteRule,
    deleteAllRules,
  } = useSplitRules(user?.id);

  const handleDelete = useCallback(
    (name: string) => {
      Alert.alert(
        "Delete split rule?",
        `Remove ${name} from your split rules?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              void deleteRule(name);
            },
          },
        ],
      );
    },
    [deleteRule],
  );

  const handleDeleteAll = useCallback(() => {
    if (rules.length === 0) return;

    Alert.alert(
      "Delete all split rules?",
      "This will remove every split rule for your account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete all",
          style: "destructive",
          onPress: () => {
            void deleteAllRules();
          },
        },
      ],
    );
  }, [deleteAllRules, rules.length]);

  if (authLoading) {
    return (
      <ThemedView style={tabsStyles.container}>
        <Loading message="Loading split rules..." />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={tabsStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshRules} />
        }
        contentContainerStyle={[
          tabsStyles.scroll,
          splitStyles.scroll,
          { paddingTop: insets.top + 24 },
        ]}
      >
        <SplitRulesHeader tint={tint} iconColor={iconColor} />

        <SplitRulesSummaryCard
          totalSplitPct={totalSplitPct}
          retainedPct={retainedPct}
          tint={tint}
          iconColor={iconColor}
        />

        <SplitRulesFormCard
          editingName={editingName}
          nameInput={nameInput}
          valueInput={valueInput}
          nameError={nameError}
          valueError={valueError}
          saving={saving}
          deletingAll={deletingAll || loadingRules}
          feedback={feedback}
          tint={tint}
          setNameInput={setNameInput}
          setValueInput={setValueInput}
          onSave={() => {
            void saveRule();
          }}
          onCancelEdit={resetForm}
        />

        <SplitRulesListCard
          rules={rules}
          loading={loadingRules}
          iconColor={iconColor}
          deletingName={deletingName}
          deletingAll={deletingAll}
          onEdit={startEditRule}
          onDelete={handleDelete}
          onDeleteAll={handleDeleteAll}
        />

        <Card style={splitStyles.correctionEntryCard}>
          <ThemedText style={splitStyles.formTitle}>
            Historical Correction
          </ThemedText>
          <ThemedText style={[splitStyles.summaryHint, { color: iconColor }]}>
            Fix split breakdown for a past period.
          </ThemedText>
          <Button
            leftIcon="arrow-forward-outline"
            onPress={() => {
              router.push("/(tabs)/(config)/historical-correction");
            }}
          >
            Open Historical Correction
          </Button>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}
