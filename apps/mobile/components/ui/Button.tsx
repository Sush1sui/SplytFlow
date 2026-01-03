import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import Colors from "@/constants/Colors";
import { Typography, BorderRadius, Spacing } from "@/constants/Theme";
import { useColorScheme } from "../useColorScheme";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: BorderRadius.md,
      opacity: disabled ? 0.5 : 1,
    };

    // Size styles
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
      md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
      lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },
    };

    // Variant styles
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: colors.primary,
      },
      secondary: {
        backgroundColor: colors.backgroundTertiary,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: colors.border,
      },
      ghost: {
        backgroundColor: "transparent",
      },
      danger: {
        backgroundColor: colors.error,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: "100%" }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<ButtonSize, TextStyle> = {
      sm: { fontSize: Typography.size.sm },
      md: { fontSize: Typography.size.base },
      lg: { fontSize: Typography.size.lg },
    };

    const variantStyles: Record<ButtonVariant, TextStyle> = {
      primary: { color: colors.textInverse },
      secondary: { color: colors.text },
      outline: { color: colors.text },
      ghost: { color: colors.primary },
      danger: { color: colors.textInverse },
    };

    return {
      fontWeight: Typography.weight.semibold,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary" || variant === "danger"
              ? colors.textInverse
              : colors.primary
          }
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
