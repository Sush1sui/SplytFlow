import { ReactNode, useState } from "react";
import { TextInput, View, Text, TextInputProps, ViewStyle } from "react-native";
import Colors from "@/constants/Colors";
import { Typography, BorderRadius, Spacing } from "@/constants/Theme";
import { useColorScheme } from "../useColorScheme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={{
            fontSize: Typography.size.sm,
            fontWeight: Typography.weight.medium,
            color: colors.text,
            marginBottom: Spacing.sm,
          }}
        >
          {label}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: BorderRadius.md,
          borderWidth: 1.5,
          borderColor: error
            ? colors.error
            : isFocused
            ? colors.primary
            : colors.border,
          paddingHorizontal: Spacing.md,
        }}
      >
        {leftIcon && (
          <View style={{ marginRight: Spacing.sm }}>{leftIcon}</View>
        )}

        <TextInput
          style={[
            {
              flex: 1,
              paddingVertical: Spacing.md,
              fontSize: Typography.size.base,
              color: colors.text,
            },
            style,
          ]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightIcon && (
          <View style={{ marginLeft: Spacing.sm }}>{rightIcon}</View>
        )}
      </View>

      {error && (
        <Text
          style={{
            fontSize: Typography.size.sm,
            color: colors.error,
            marginTop: Spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
