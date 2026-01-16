import { View, Text } from "react-native";
import { Card } from "@/components/ui";
import { analyticsGeneralStyles as styles } from "./analytics-general-styles";
import Colors from "@/constants/Colors";

export default function OverviewStats() {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <Card style={styles.overviewCard}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Overview</Text>

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Sales
          </Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            $0.00
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Costs
          </Text>
          <Text style={[styles.statValue, { color: colors.error }]}>$0.00</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.stat}>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Net Profit
        </Text>
        <Text style={[styles.profitValue, { color: colors.success }]}>
          $0.00
        </Text>
        <Text style={[styles.profitMargin, { color: colors.textTertiary }]}>
          0% profit margin
        </Text>
      </View>
    </Card>
  );
}
