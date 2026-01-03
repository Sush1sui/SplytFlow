import { View, Text, useColorScheme } from "react-native";
import { Card } from "../../Card";
import { Typography } from "@/constants/Theme";
import { HomeStylesType } from "@/app/(tabs)/home";
import Colors from "@/constants/Colors";

export default function RecentSalesHome({
  styles,
}: {
  styles: HomeStylesType;
}) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <Card style={styles.recentCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Recent Sales</Text>
        <Text style={{ color: colors.primary, fontSize: Typography.size.sm }}>
          View All
        </Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          No sales yet today
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
          Add your first sale to get started
        </Text>
      </View>
    </Card>
  );
}
