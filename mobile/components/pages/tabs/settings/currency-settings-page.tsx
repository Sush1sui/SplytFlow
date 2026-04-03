import React, { useCallback, useEffect, useRef } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";
import SettingsPageHeader from "./settings-page-header";
import useCurrencySettings from "@/lib/context/currency-context";
import useAlertDialog from "@/components/shared/use-alert-dialog";
import AlertDialogModal from "@/components/shared/alert-dialog-modal";
import useToast from "@/lib/context/toast-context";
import type { SupportedCurrencyCode } from "@/constants/currency";

export default function CurrencySettingsPage() {
  const insets = useSafeAreaInsets();
  const { font, space } = useTabResponsive();
  const { showToast } = useToast();
  const { alertDialogProps, showConfirm } = useAlertDialog();
  const initialPromptShownRef = useRef(false);

  const {
    isReady,
    isUpdating,
    selectedCurrency,
    baseCurrency,
    initialDecisionNeeded,
    currencyOptions,
    currentCurrencyLabel,
    applyCurrencySelection,
  } = useCurrencySettings();

  const openCurrencyDecisionDialog = useCallback(
    (nextCurrency: SupportedCurrencyCode, isInitialPrompt: boolean) => {
      showConfirm({
        title: isInitialPrompt
          ? `Set your currency to ${nextCurrency}?`
          : `Switch currency to ${nextCurrency}?`,
        message:
          "Should we convert your current amounts to this currency, or keep the same numbers and only change the currency label?",
        confirmText: "Convert amounts",
        cancelText: "Keep numbers",
        disableBackdropClose: true,
        onConfirm: async () => {
          const result = await applyCurrencySelection(nextCurrency, "convert");

          if (!result.ok) {
            showToast({
              message: result.error ?? "Could not update currency.",
              type: "danger",
            });
            return;
          }

          showToast({
            message: `Currency updated to ${nextCurrency}. Amounts will be converted.`,
            type: "success",
          });
        },
        onCancel: async () => {
          const result = await applyCurrencySelection(nextCurrency, "keep");

          if (!result.ok) {
            showToast({
              message: result.error ?? "Could not update currency.",
              type: "danger",
            });
            return;
          }

          showToast({
            message: `Currency updated to ${nextCurrency}. Numbers were kept as-is.`,
            type: "success",
          });
        },
      });
    },
    [applyCurrencySelection, showConfirm, showToast],
  );

  useEffect(() => {
    if (!isReady || !initialDecisionNeeded || initialPromptShownRef.current) {
      return;
    }

    initialPromptShownRef.current = true;
    openCurrencyDecisionDialog(selectedCurrency, true);
  }, [
    initialDecisionNeeded,
    isReady,
    openCurrencyDecisionDialog,
    selectedCurrency,
  ]);

  return (
    <YStack
      style={{ flex: 1, backgroundColor: "#f4f6fb", paddingTop: insets.top }}
    >
      <ScrollView
        contentContainerStyle={[
          {
            paddingHorizontal: 20,
            paddingTop: 16,
          },
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$4">
          <SettingsPageHeader title="Currency" disabled={isUpdating} />

          <YStack
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              padding: 16,
            }}
            gap="$1.5"
          >
            <Paragraph
              style={{
                color: "#0f172a",
                fontWeight: "800",
                fontSize: font(16, 14, 17),
              }}
            >
              Current Currency
            </Paragraph>
            <Paragraph style={{ color: "#475569", fontSize: font(14, 13, 15) }}>
              {currentCurrencyLabel}
            </Paragraph>
            <Paragraph style={{ color: "#64748b", fontSize: font(13, 12, 14) }}>
              {selectedCurrency === baseCurrency
                ? "Numbers stay exactly the same."
                : `Numbers are converted from ${baseCurrency}.`}
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <Paragraph
              style={{
                color: "#94a3b8",
                fontWeight: "800",
                fontSize: font(12, 10, 13),
              }}
            >
              AVAILABLE CURRENCIES
            </Paragraph>

            <YStack
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#e2e8f0",
                backgroundColor: "#ffffff",
                overflow: "hidden",
              }}
            >
              {currencyOptions.map((option, index) => {
                const isSelected = option.code === selectedCurrency;

                return (
                  <Button
                    key={option.code}
                    unstyled
                    chromeless
                    disabled={isUpdating}
                    pressStyle={{ opacity: 0.72, background: "#f8fafc" }}
                    onPress={() => {
                      if (!initialDecisionNeeded && isSelected) {
                        return;
                      }

                      openCurrencyDecisionDialog(option.code, false);
                    }}
                  >
                    <XStack
                      style={{
                        alignItems: "center",
                        paddingHorizontal: space(14),
                        paddingVertical: space(14),
                        borderTopWidth: index === 0 ? 0 : 1,
                        borderTopColor: "#edf1f8",
                        opacity: isUpdating ? 0.65 : 1,
                      }}
                      gap="$2"
                    >
                      <Paragraph
                        style={{
                          flex: 1,
                          color: "#0f172a",
                          fontWeight: isSelected ? "700" : "600",
                          fontSize: font(16, 13, 17),
                        }}
                      >
                        {option.code} - {option.name}
                      </Paragraph>
                      {isSelected ? (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={18}
                          color="#16a34a"
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={18}
                          color="#9aa5b5"
                        />
                      )}
                    </XStack>
                  </Button>
                );
              })}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      <AlertDialogModal {...alertDialogProps} />
    </YStack>
  );
}
