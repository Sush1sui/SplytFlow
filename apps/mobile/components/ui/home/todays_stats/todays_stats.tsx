import { Text, View, ActivityIndicator } from "react-native";
import { Card } from "@/components/ui";
import { homeStylesGeneral as styles } from "../home-styles-general";
import Colors from "@/constants/Colors";
import {
  useEarningsSummary,
  useTodayDateRange,
  useFormatCurrency,
} from "@/src/hooks/use-api";

export default function TodaysStatsHome() {
  const colorScheme = "light";
  const colors = Colors[colorScheme];
  const { startDate, endDate } = useTodayDateRange();
  const {
    data: summary,
    loading,
    error,
  } = useEarningsSummary({
    startDate,
    endDate,
  });
  const formatCurrency = useFormatCurrency();

  if (loading) {
    return (
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { alignItems: "center" }]}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      </View>
    );
  }

  if (error) {
    console.error("Today's stats error:", error);
    return (
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.error }]}>
            Error loading today's stats
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
          >
            {error.message}
          </Text>
        </Card>
      </View>
    );
  }

  const totalEarnings = summary?.totalEarnings || 0;
  const afterSplits = summary?.totalAfterSplits || 0;

  return (
    <View style={styles.statsContainer}>
      <Card style={styles.statCard}>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Today's Earnings
        </Text>
        <Text style={[styles.statValue, { color: colors.primary }]}>
          {formatCurrency(totalEarnings)}
        </Text>
        <Text style={[styles.statChange, { color: colors.textTertiary }]}>
          Total earned today
        </Text>
      </Card>

      <Card style={styles.statCard}>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          After Splits
        </Text>
        <Text style={[styles.statValue, { color: colors.success }]}>
          {formatCurrency(afterSplits)}
        </Text>
        <Text style={[styles.statChange, { color: colors.textTertiary }]}>
          Your take-home
        </Text>
      </Card>
    </View>
  );
}
