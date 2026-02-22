import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  const background = useThemeColor({}, "background");
  const borderColor = useThemeColor(
    { light: "#E6E9EA", dark: "#2A2D2E" },
    "icon",
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: background,
          borderColor: borderColor,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
});
