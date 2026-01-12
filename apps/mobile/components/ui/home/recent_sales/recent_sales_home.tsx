import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Card } from "../../Card";
import { Typography, Spacing } from "@/constants/Theme";
import { homeStylesGeneral as styles } from "@/components/ui/home/home-styles-general";
import Colors from "@/constants/Colors";
import { useEarnings, useFormatCurrency } from "@/src/hooks/use-api";

export default function RecentSalesHome({
  onRefresh,
}: {
  onRefresh?: () => void;
}) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];
  const { data: earnings, loading, error, refetch } = useEarnings({ limit: 5 });
  const formatCurrency = useFormatCurrency();

  if (loading) {
    return (
      <Card style={styles.recentCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Entries</Text>
        </View>
        <View
          style={[styles.emptyState, { alignItems: "center", paddingTop: 20 }]}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.recentCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Entries</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.error }]}>
            Error loading entries
          </Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={{ color: colors.primary, marginTop: Spacing.sm }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  const handleEarningPress = (earning: (typeof earnings)[0]) => {
    const allocationsText = earning.allocations
      .map(
        (alloc) =>
          `${alloc.splitConfig.name}: ${formatCurrency(Number(alloc.amount))}`
      )
      .join("\n");

    Alert.alert(
      "Earning Details",
      `Amount: ${formatCurrency(Number(earning.amount))}\n` +
        `Date: ${new Date(earning.date).toLocaleDateString()}\n` +
        (earning.description
          ? `Description: ${earning.description}\n\n`
          : "\n") +
        `Split Breakdown:\n${allocationsText || "No splits configured"}`,
      [{ text: "Close" }]
    );
  };

  return (
    <Card style={styles.recentCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Recent Entries</Text>
        {earnings.length > 0 && (
          <TouchableOpacity onPress={() => console.log("View all")}>
            <Text
              style={{ color: colors.primary, fontSize: Typography.size.sm }}
            >
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {earnings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            No earnings yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Add your first earning to get started
          </Text>
        </View>
      ) : (
        <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
          {earnings.map((earning) => (
            <TouchableOpacity
              key={earning.id}
              onPress={() => handleEarningPress(earning)}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: Spacing.sm,
                paddingHorizontal: Spacing.xs,
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: Typography.size.sm,
                    color: colors.textSecondary,
                    marginBottom: 2,
                  }}
                >
                  {new Date(earning.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text
                  style={{
                    fontSize: Typography.size.md,
                    color: colors.text,
                    fontWeight: "600",
                  }}
                  numberOfLines={1}
                >
                  {earning.description || "Earning"}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: Typography.size.lg,
                  color: colors.primary,
                  fontWeight: "700",
                }}
              >
                {formatCurrency(Number(earning.amount))}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );
}
