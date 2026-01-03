import { Text, useColorScheme, View } from "react-native";
import { Card } from "@/components/ui";
import { HomeStylesType } from "@/app/(tabs)/home";
import Colors from "@/constants/Colors";

export default function TodaysStatsHome({
  styles,
}: {
  styles: HomeStylesType;
}) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.statsContainer}>
      <Card style={styles.statCard}>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Today's Sales
        </Text>
        <Text style={[styles.statValue, { color: colors.primary }]}>$0.00</Text>
        <Text style={[styles.statChange, { color: colors.success }]}>
          +0% from yesterday
        </Text>
      </Card>

      <Card style={styles.statCard}>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Net Profit
        </Text>
        <Text style={[styles.statValue, { color: colors.success }]}>$0.00</Text>
        <Text style={[styles.statChange, { color: colors.textTertiary }]}>
          After all costs
        </Text>
      </Card>
    </View>
  );
}
