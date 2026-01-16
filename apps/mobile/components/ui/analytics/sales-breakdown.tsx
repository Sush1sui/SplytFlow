import { Card } from "@/components/ui";
import { Text, View } from "react-native";
import { analyticsGeneralStyles as styles } from "./analytics-general-styles";
import Colors from "@/constants/Colors";

export default function SalesBreakdown() {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <Card style={styles.breakdownCard}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        Sales Breakdown
      </Text>

      <View style={styles.emptyState}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          No sales data for this period
        </Text>
      </View>
    </Card>
  );
}
