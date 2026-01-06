import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Colors from "@/constants/Colors";
import { Typography, Spacing } from "@/constants/Theme";
import { useColorScheme } from "./useColorScheme";

interface LoadingProps {
  message?: string;
}

export function Loading({ message = "Loading..." }: LoadingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.spinner}
        />
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: Spacing.md,
  },
  spinner: {
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    textAlign: "center",
  },
});
