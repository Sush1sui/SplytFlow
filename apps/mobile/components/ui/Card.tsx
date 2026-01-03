import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import Colors from "@/constants/Colors";
import { BorderRadius, Spacing, Shadow } from "@/constants/Theme";
import { useColorScheme } from "../useColorScheme";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  elevated?: boolean;
}

export function Card({
  children,
  style,
  padding = "md",
  elevated = true,
}: CardProps) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: BorderRadius.lg,
          padding: Spacing[padding],
          borderWidth: 1,
          borderColor: colors.border,
        },
        elevated && Shadow.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}
