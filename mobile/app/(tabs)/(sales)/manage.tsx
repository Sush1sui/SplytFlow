import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemedText } from "@/components/themed-text";
import { Loading } from "@/components/ui/loading";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import useSalesStyles from "@/app/(tabs)/(sales)/sales-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthContext } from "@/lib/context/auth-context";
import { API_ENDPOINTS } from "@/constants/api";
import { markSalesAnalyticsDirty } from "@/lib/state/sales-analytics-cache";
import {
  getRecentSalesDaySummary,
  removeRecentSalesLogsForLocalDay,
} from "@/lib/state/recent-sales-logs";
import { authenticatedFetch } from "@/lib/utils/auth-fetch";

type SetDayResponse = {
  sale: { id: string; amount: number; createdAt: string } | null;
  deleted: boolean;
};

type SalesRangeResponse = {
  sales: { id: string; amount: number; createdAt: string }[];
  net_sale: number;
};

type FeedbackState = {
  type: "success" | "error";
  text: string;
} | null;

const FLOAT_TOLERANCE = 1e-6;

const toStartOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toLocalNoon = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);

const formatDate = (date: Date) =>
  date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatMoney = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function ManageSalesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabsStyles = useTabsStyles();
  const salesStyles = useSalesStyles();
  const { user, loading: authLoading } = useAuthContext();
  const iconColor = useThemeColor({}, "icon");
  const tint = useThemeColor({}, "tint");

  const [selectedDate, setSelectedDate] = useState(() =>
    toStartOfLocalDay(new Date()),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [currentAmount, setCurrentAmount] = useState<number | null>(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const isBusy = saving || deleting || loadingDay;

  const selectedDateMeta = useMemo(() => {
    const localNoon = toLocalNoon(selectedDate);
    return {
      recordedAt: localNoon.toISOString(),
      utcOffsetMinutes: -localNoon.getTimezoneOffset(),
    };
  }, [selectedDate]);

  const loadDayAmount = useCallback(async () => {
    if (!user?.id) return;

    const start = toStartOfLocalDay(selectedDate);
    const end = addDays(start, 1);

    setLoadingDay(true);
    setFeedback(null);

    try {
      const query =
        `?startDate=${encodeURIComponent(start.toISOString())}` +
        `&endDate=${encodeURIComponent(end.toISOString())}`;

      const result = await authenticatedFetch<SalesRangeResponse>(
        `${API_ENDPOINTS.SALES.BY_USER(user.id)}${query}`,
        { method: "GET" },
      );

      const first = Array.isArray(result.sales) ? result.sales[0] : null;
      const amount = first ? Number(first.amount) || 0 : null;
      setCurrentAmount(amount);
      setAmountInput(amount !== null ? String(amount) : "");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (message.includes("404")) {
        setCurrentAmount(null);
        setAmountInput("");
      } else {
        setFeedback({
          type: "error",
          text: "Could not load sales for this date.",
        });
      }
    } finally {
      setLoadingDay(false);
    }
  }, [selectedDate, user?.id]);

  useEffect(() => {
    void loadDayAmount();
  }, [loadDayAmount]);

  const setDayAmount = useCallback(
    async (amount: number) => {
      if (!user?.id) {
        throw new Error("Missing account. Please sign in again.");
      }

      return authenticatedFetch<SetDayResponse>(API_ENDPOINTS.SALES.SET_DAY, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount,
          recordedAt: selectedDateMeta.recordedAt,
          utcOffsetMinutes: selectedDateMeta.utcOffsetMinutes,
        }),
      });
    },
    [selectedDateMeta.recordedAt, selectedDateMeta.utcOffsetMinutes, user?.id],
  );

  const clearIncompatibleLogsForSelectedDay = useCallback(
    async (nextDayAmount: number) => {
      if (!user?.id) return 0;

      try {
        const daySummary = await getRecentSalesDaySummary(
          user.id,
          selectedDate,
        );
        const shouldKeepLogs =
          daySummary.count === 0 ||
          nextDayAmount + FLOAT_TOLERANCE >= daySummary.totalAmount;

        if (shouldKeepLogs) {
          return 0;
        }

        const { removed } = await removeRecentSalesLogsForLocalDay(
          user.id,
          selectedDate,
        );
        return removed;
      } catch (error) {
        console.warn("Failed to reconcile recent activity", error);
        return 0;
      }
    },
    [selectedDate, user?.id],
  );

  const clearAllLogsForSelectedDay = useCallback(async () => {
    if (!user?.id) return 0;

    try {
      const { removed } = await removeRecentSalesLogsForLocalDay(
        user.id,
        selectedDate,
      );
      return removed;
    } catch (error) {
      console.warn("Failed to clear recent activity", error);
      return 0;
    }
  }, [selectedDate, user?.id]);

  const onSaveDay = useCallback(async () => {
    if (!amountInput.trim()) {
      Alert.alert("Invalid amount", "Enter an amount before saving.");
      return;
    }

    const parsed = Number(amountInput);

    if (!Number.isFinite(parsed) || parsed < 0) {
      Alert.alert("Invalid amount", "Enter a valid amount (0 or more).");
      return;
    }

    try {
      setSaving(true);
      const result = await setDayAmount(parsed);
      markSalesAnalyticsDirty(user?.id);
      const removedLogs = await clearIncompatibleLogsForSelectedDay(parsed);
      const recentActivityNote =
        removedLogs > 0
          ? " Recent activity was updated to match this change."
          : "";

      if (result.deleted) {
        setCurrentAmount(null);
        setAmountInput("");
        setFeedback({
          type: "success",
          text: `Sales for this day were removed.${recentActivityNote}`,
        });
      } else {
        const saved = Number(result.sale?.amount) || parsed;
        setCurrentAmount(saved);
        setAmountInput(String(saved));
        setFeedback({
          type: "success",
          text: `Saved ${formatMoney(saved)} for ${formatDate(
            selectedDate,
          )}.${recentActivityNote}`,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save this date.";
      setFeedback({ type: "error", text: message });
    } finally {
      setSaving(false);
    }
  }, [
    amountInput,
    clearIncompatibleLogsForSelectedDay,
    selectedDate,
    setDayAmount,
    user?.id,
  ]);

  const onDeleteDay = useCallback(() => {
    Alert.alert(
      "Delete this day?",
      "This will remove all sales saved for the selected day.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                setDeleting(true);
                const result = await setDayAmount(0);
                markSalesAnalyticsDirty(user?.id);
                const removedLogs = await clearAllLogsForSelectedDay();
                const recentActivityNote =
                  removedLogs > 0
                    ? " Recent activity was updated to match this change."
                    : "";

                if (result.deleted) {
                  setCurrentAmount(null);
                  setAmountInput("");
                  setFeedback({
                    type: "success",
                    text: `Selected day has been deleted.${recentActivityNote}`,
                  });
                } else {
                  setFeedback({
                    type: "success",
                    text: `No sales found for that date.${recentActivityNote}`,
                  });
                }
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : "Delete failed.";
                setFeedback({ type: "error", text: message });
              } finally {
                setDeleting(false);
              }
            })();
          },
        },
      ],
    );
  }, [clearAllLogsForSelectedDay, setDayAmount, user?.id]);

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setSelectedDate(toStartOfLocalDay(date));
    }
  };

  const onOpenDatePicker = useCallback(() => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: "date",
        display: "default",
        maximumDate: new Date(),
        onChange: (_event, date) => {
          if (date) {
            setSelectedDate(toStartOfLocalDay(date));
          }
        },
      });
      return;
    }

    setShowDatePicker(true);
  }, [selectedDate]);

  if (authLoading) {
    return (
      <ThemedView style={tabsStyles.container}>
        <Loading message="Loading sales manager..." />
      </ThemedView>
    );
  }

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
        <View style={salesStyles.headerWrap}>
          <View style={[tabsStyles.headerRow, salesStyles.headerRow]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={[
                tabsStyles.centerContent,
                salesStyles.logoCircle,
                { backgroundColor: `${tint}14` },
              ]}
            >
              <Ionicons name="arrow-back" size={20} color={tint} />
            </TouchableOpacity>
            <View style={salesStyles.headerTextWrap}>
              <ThemedText type="title" style={tabsStyles.title}>
                Manage Sales
              </ThemedText>
              <ThemedText style={[salesStyles.subtitle, { color: iconColor }]}>
                Set or delete sales for a specific day
              </ThemedText>
            </View>
          </View>
        </View>

        <Card style={salesStyles.manageCard}>
          <ThemedText style={[salesStyles.manageLabel, { color: iconColor }]}>
            Date
          </ThemedText>

          <TouchableOpacity
            activeOpacity={0.82}
            disabled={isBusy}
            onPress={onOpenDatePicker}
            style={[
              salesStyles.manageDateButton,
              {
                borderColor: `${iconColor}40`,
                backgroundColor: `${iconColor}10`,
                opacity: isBusy ? 0.7 : 1,
              },
            ]}
          >
            <ThemedText style={[salesStyles.manageDateText, { color: tint }]}>
              {formatDate(selectedDate)}
            </ThemedText>
            <Ionicons name="calendar-outline" size={16} color={tint} />
          </TouchableOpacity>

          {Platform.OS === "ios" && showDatePicker ? (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          ) : null}

          <Input
            label="Sales amount"
            keyboardType="decimal-pad"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="0.00"
            value={amountInput}
            onChangeText={setAmountInput}
            editable={!isBusy}
            helperText="Set to 0 to remove this day."
          />

          <ThemedText
            style={[salesStyles.manageCurrentValue, { color: iconColor }]}
          >
            {loadingDay
              ? "Checking selected date..."
              : currentAmount === null
                ? "Current saved amount: none"
                : `Current saved amount: ${formatMoney(currentAmount)}`}
          </ThemedText>

          <View style={salesStyles.manageActionsRow}>
            <Button
              variant="primary"
              leftIcon="save-outline"
              loading={saving}
              disabled={isBusy}
              onPress={() => {
                void onSaveDay();
              }}
            >
              Save Day Amount
            </Button>

            <Button
              variant="outline"
              leftIcon="trash-outline"
              loading={deleting}
              disabled={isBusy}
              onPress={onDeleteDay}
            >
              Delete Selected Day
            </Button>
          </View>

          {feedback ? (
            <View
              style={[
                salesStyles.manageFeedbackCard,
                {
                  borderColor:
                    feedback.type === "success"
                      ? `${tint}55`
                      : "rgba(239,68,68,0.5)",
                  backgroundColor:
                    feedback.type === "success"
                      ? `${tint}1A`
                      : "rgba(239,68,68,0.12)",
                },
              ]}
            >
              <ThemedText style={salesStyles.manageFeedbackText}>
                {feedback.text}
              </ThemedText>
            </View>
          ) : null}
        </Card>
      </ScrollView>
    </ThemedView>
  );
}
