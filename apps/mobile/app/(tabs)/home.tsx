import { useState, useCallback, useEffect } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { View } from "@/components/Themed";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { homeStylesGeneral as styles } from "@/components/ui/home/home-styles-general";

import RecentSalesHome from "@/components/ui/home/recent_sales/recent_sales_home";
import QuickAddSalesHome from "@/components/ui/home/quick_add_sales/quick_add_sales_home";
import TodaysStatsHome from "@/components/ui/home/todays_stats/todays_stats";
import { useAuthContext } from "@/src/hooks/use-auth-context";
import { setUserId } from "@/src/lib/api-client";
import { Loading } from "@/components/Loading";

export default function HomeScreen() {
  console.log("Rendering HomeScreen");
  const { profile } = useAuthContext();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userIdSet, setUserIdSet] = useState(false);

  const colorScheme = "light";
  const colors = Colors[colorScheme];

  // Set user ID for API calls
  useEffect(() => {
    if (profile?.id) {
      console.log("Setting user ID for API calls:", profile.id);
      setUserId(profile.id); // Use numeric database ID
      setUserIdSet(true);
    }
  }, [profile]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleEarningAdded = useCallback(() => {
    // Trigger refresh when new earning is added
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Don't render data components until user ID is set
  if (!userIdSet) {
    return <Loading message="Fetching user data..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {getGreeting()} 👋
          </Text>
          {profile?.display_name && (
            <Text
              style={[styles.subtitle, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {profile.display_name}
            </Text>
          )}
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Here's your earnings today
          </Text>
        </View>

        {/* Today's Stats */}
        <TodaysStatsHome key={`stats-${refreshKey}`} />

        {/* Quick Add Sale Card */}
        <QuickAddSalesHome onSuccess={handleEarningAdded} />

        {/* Recent Sales */}
        <RecentSalesHome key={`recent-${refreshKey}`} />
      </ScrollView>
    </View>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
