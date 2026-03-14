import React, { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "@/components/ui/card";
import { ThemedText } from "@/components/themed-text";
import useHomeStyles from "@/app/(tabs)/home-stylesheet";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";

import { sanitizeSaleAmountInput } from "./formatters";

type QuickAddSalesCardProps = {
  onSubmit: (amount: number) => Promise<void>;
};

function QuickAddSalesCardComponent({ onSubmit }: QuickAddSalesCardProps) {
  const [quickSaleAmount, setQuickSaleAmount] = useState("");
  const [quickInputFocused, setQuickInputFocused] = useState(false);
  const [quickSaleSubmitting, setQuickSaleSubmitting] = useState(false);

  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const textColor = useThemeColor({}, "text");
  const homeStyles = useHomeStyles();
  const tabsStyles = useTabsStyles();

  const isQuickAmountValid =
    Number.isFinite(Number.parseFloat(quickSaleAmount)) &&
    Number.parseFloat(quickSaleAmount) > 0;
  const canSubmitQuickSale = isQuickAmountValid && !quickSaleSubmitting;

  const normalizedTint = (tint || "").toString().trim().toLowerCase();
  const ctaOnTint =
    normalizedTint === "#fff" || normalizedTint === "#ffffff"
      ? "#11181C"
      : "#FFFFFF";

  const quickAmountBorderColor = quickInputFocused
    ? tint
    : isQuickAmountValid
      ? `${tint}66`
      : `${iconColor}55`;
  const quickAmountBackground = quickInputFocused ? `${tint}0D` : "transparent";
  const quickAddButtonBg = canSubmitQuickSale ? tint : `${iconColor}22`;
  const quickAddButtonBorder = canSubmitQuickSale ? tint : `${iconColor}44`;
  const quickAddButtonIcon = canSubmitQuickSale ? ctaOnTint : `${iconColor}AA`;

  const handleAmountChange = useCallback((value: string) => {
    setQuickSaleAmount(sanitizeSaleAmountInput(value));
  }, []);

  const handleSubmit = useCallback(async () => {
    const amount = Number.parseFloat(quickSaleAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid sales amount.");
      return;
    }

    try {
      setQuickSaleSubmitting(true);
      await onSubmit(amount);
      setQuickSaleAmount("");
      setQuickInputFocused(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add sale. Please try again.";
      Alert.alert("Quick Add Failed", message);
    } finally {
      setQuickSaleSubmitting(false);
    }
  }, [onSubmit, quickSaleAmount]);

  const rightControl = useMemo(
    () =>
      quickSaleSubmitting ? (
        <ActivityIndicator size="small" color={quickAddButtonIcon} />
      ) : (
        <Ionicons
          name="paper-plane-outline"
          size={20}
          color={quickAddButtonIcon}
        />
      ),
    [quickAddButtonIcon, quickSaleSubmitting],
  );

  return (
    <Card>
      <View style={homeStyles.quickAddHeader}>
        <View
          style={[
            tabsStyles.centerContent,
            homeStyles.quickAddBadge,
            { backgroundColor: `${tint}16` },
          ]}
        >
          <Ionicons name="receipt-outline" size={18} color={tint} />
        </View>
        <View style={homeStyles.quickAddHeaderText}>
          <ThemedText style={homeStyles.quickAddTitle}>
            Quick Add Sales Today
          </ThemedText>
          <ThemedText
            style={[homeStyles.quickAddSubtitle, { color: iconColor }]}
          >
            Add a sale for today
          </ThemedText>
        </View>
      </View>

      <View style={homeStyles.quickAddFormRow}>
        <View
          style={[
            homeStyles.quickAddAmountRow,
            {
              borderColor: quickAmountBorderColor,
              backgroundColor: quickAmountBackground,
            },
          ]}
        >
          <TextInput
            value={quickSaleAmount}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={`${iconColor}AA`}
            onFocus={() => setQuickInputFocused(true)}
            onBlur={() => setQuickInputFocused(false)}
            returnKeyType="done"
            onSubmitEditing={() => {
              void handleSubmit();
            }}
            style={[homeStyles.quickAddAmountInput, { color: textColor }]}
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            void handleSubmit();
          }}
          disabled={!canSubmitQuickSale}
          activeOpacity={0.8}
          style={[
            homeStyles.quickAddIconButton,
            {
              backgroundColor: quickAddButtonBg,
              borderColor: quickAddButtonBorder,
            },
          ]}
        >
          {rightControl}
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export const QuickAddSalesCard = memo(QuickAddSalesCardComponent);
