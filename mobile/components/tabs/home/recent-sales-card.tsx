import React, { memo } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "@/components/ui/card";
import { ThemedText } from "@/components/themed-text";
import useHomeStyles from "@/app/(tabs)/home-stylesheet";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";

import { formatAmount, formatSaleTime } from "./formatters";
import type { RecentSaleLog } from "./types";

const HOME_RECENT_SALES_DISPLAY_LIMIT = 5;

type RecentSalesCardProps = {
  sales: RecentSaleLog[];
  loading: boolean;
  clearingLogs: boolean;
  removingLogId: string | null;
  onClearLogs: () => Promise<void>;
  onRemoveLog: (saleId: string) => Promise<void>;
};

function RecentSalesCardComponent({
  sales,
  loading,
  clearingLogs,
  removingLogId,
  onClearLogs,
  onRemoveLog,
}: RecentSalesCardProps) {
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const homeStyles = useHomeStyles();
  const tabsStyles = useTabsStyles();
  const isAnyRemoveInFlight = removingLogId !== null;
  const visibleSales = sales.slice(0, HOME_RECENT_SALES_DISPLAY_LIMIT);

  const handleClearLogsPress = () => {
    Alert.alert(
      "Clear recent logs?",
      "This only clears the local recent logs list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await onClearLogs();
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Failed to clear recent logs.";
                Alert.alert("Clear Failed", message);
              }
            })();
          },
        },
      ],
    );
  };

  const handleRemoveLogPress = (sale: RecentSaleLog) => {
    Alert.alert(
      "Remove this sale?",
      `This will deduct ${formatAmount(sale.amount)} from your sales.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await onRemoveLog(sale.id);
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Failed to remove sale log.";
                Alert.alert("Remove Failed", message);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <View style={homeStyles.recentSection}>
      <View style={homeStyles.recentHeaderRow}>
        <ThemedText
          style={[
            tabsStyles.sectionTitle,
            homeStyles.recentHeaderTitle,
            { color: iconColor },
          ]}
        >
          RECENT SALES
        </ThemedText>

        {sales.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={clearingLogs}
            onPress={handleClearLogsPress}
            style={[
              homeStyles.recentClearButton,
              {
                borderColor: `${iconColor}55`,
                backgroundColor: `${iconColor}14`,
              },
              clearingLogs && homeStyles.recentActionDisabled,
            ]}
          >
            {clearingLogs ? (
              <ActivityIndicator size="small" color={iconColor} />
            ) : (
              <ThemedText
                style={[homeStyles.recentClearText, { color: iconColor }]}
              >
                Clear
              </ThemedText>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Card>
        {loading ? (
          <View style={homeStyles.recentEmptyRow}>
            <ThemedText
              style={[homeStyles.recentEmptyText, { color: iconColor }]}
            >
              Loading recent sales...
            </ThemedText>
          </View>
        ) : visibleSales.length === 0 ? (
          <View style={homeStyles.recentEmptyRow}>
            <ThemedText
              style={[homeStyles.recentEmptyText, { color: iconColor }]}
            >
              No recent sales in the last 7 days
            </ThemedText>
          </View>
        ) : (
          visibleSales.map((sale, index) => {
            const isRemoving = removingLogId === sale.id;

            return (
              <View key={sale.id}>
                <View style={homeStyles.recentRow}>
                  <View
                    style={[
                      tabsStyles.centerContent,
                      homeStyles.recentIcon,
                      { backgroundColor: `${tint}16` },
                    ]}
                  >
                    <Ionicons name="time-outline" size={16} color={tint} />
                  </View>
                  <View style={homeStyles.recentInfo}>
                    <ThemedText style={homeStyles.recentLabel}>Sale</ThemedText>
                    <ThemedText
                      style={[homeStyles.recentTime, { color: iconColor }]}
                    >
                      {formatSaleTime(sale.createdAt)}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[homeStyles.recentAmount, { color: tint }]}
                  >
                    {formatAmount(Number(sale.amount) || 0)}
                  </ThemedText>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isAnyRemoveInFlight || clearingLogs}
                    onPress={() => {
                      handleRemoveLogPress(sale);
                    }}
                    style={[
                      homeStyles.recentRemoveButton,
                      {
                        borderColor: `${iconColor}44`,
                        backgroundColor: `${iconColor}14`,
                      },
                      (isAnyRemoveInFlight || clearingLogs) &&
                        homeStyles.recentActionDisabled,
                    ]}
                  >
                    {isRemoving ? (
                      <ActivityIndicator size="small" color={iconColor} />
                    ) : (
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={iconColor}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                {index < visibleSales.length - 1 && (
                  <View style={tabsStyles.divider} />
                )}
              </View>
            );
          })
        )}
      </Card>
    </View>
  );
}

export const RecentSalesCard = memo(RecentSalesCardComponent);
