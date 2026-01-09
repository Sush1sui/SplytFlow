import { ScrollView } from "react-native";
import { View } from "@/components/Themed";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { homeStylesGeneral as styles } from "@/components/ui/home/home-styles-general";

import RecentSalesHome from "@/components/ui/home/recent_sales/recent_sales_home";
import QuickAddSalesHome from "@/components/ui/home/quick_add_sales/quick_add_sales_home";
import TodaysStatsHome from "@/components/ui/home/todays_stats/todays_stats";

export default function HomeScreen() {
  console.log("Rendering HomeScreen");

  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Good morning 👋
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Here's your business today
          </Text>
        </View>

        {/* Today's Stats */}
        <TodaysStatsHome />

        {/* Quick Add Sale Card */}
        <QuickAddSalesHome />

        {/* Recent Sales */}
        <RecentSalesHome />
      </ScrollView>
    </View>
  );
}
