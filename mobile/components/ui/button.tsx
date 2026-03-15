import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps extends TouchableOpacityProps {
  children: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "medium",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const tint = useThemeColor({}, "tint");

  const normalizedTint = (tint || "").toString().trim().toLowerCase();
  const primaryTextColor =
    normalizedTint === "#fff" || normalizedTint === "#ffffff"
      ? "#11181C"
      : "#fff";

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      opacity: disabled || loading ? 0.5 : 1,
    };

    switch (variant) {
      case "primary":
        return { ...baseStyle, backgroundColor: tint };
      case "secondary":
        return { ...baseStyle, backgroundColor: `${tint}20` };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: tint,
        };
      case "ghost":
        return { ...baseStyle, backgroundColor: "transparent" };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
        return primaryTextColor;
      case "secondary":
      case "outline":
      case "ghost":
        return tint;
      default:
        return primaryTextColor;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return { height: 40, paddingHorizontal: 16 };
      case "medium":
        return { height: 52, paddingHorizontal: 24 };
      case "large":
        return { height: 60, paddingHorizontal: 32 };
      default:
        return { height: 52, paddingHorizontal: 24 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return 14;
      case "medium":
        return 16;
      case "large":
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getSizeStyle(),
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={getFontSize() + 2}
              color={getTextColor()}
              style={styles.leftIcon}
            />
          )}
          <ThemedText
            style={[
              styles.text,
              { color: getTextColor(), fontSize: getFontSize() },
            ]}
          >
            {children}
          </ThemedText>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={getFontSize() + 2}
              color={getTextColor()}
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontWeight: "600",
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
