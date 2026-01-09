import { TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Text } from "@/components/Themed";
import { Card } from "@/components/ui";
import { Typography, Spacing } from "@/constants/Theme";
import Colors from "@/constants/Colors";
import { supabase } from "@/src/lib/db";
import { useState } from "react";

export default function LogoutButton() {
  const colorScheme = "light";
  const colors = Colors[colorScheme];
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              const { error } = await supabase.auth.signOut();

              if (error) {
                console.error("Logout error:", error);
                Alert.alert("Error", "Failed to log out. Please try again.");
                return;
              }

              // Navigation will be handled by the auth provider
              console.log("Logged out successfully");
            } catch (err) {
              console.error("Unexpected logout error:", err);
              Alert.alert("Error", "An unexpected error occurred.");
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
        disabled={isLoggingOut}
      >
        <Text style={[styles.logoutText, { color: colors.error }]}>
          {isLoggingOut ? "Logging Out..." : "Log Out"}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
  },
  logoutButton: {
    padding: Spacing.md,
    alignItems: "center",
  },
  logoutText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
});
