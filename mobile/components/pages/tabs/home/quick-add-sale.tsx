import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { YStack, Paragraph, XStack, Input, Button, Spinner } from "tamagui";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { useAuthState } from "@/lib/context/auth-context";
import useToast from "@/lib/context/toast-context";
import { addSale, fetchSales, fetchSalesHistory } from "@/lib/store/saleSlice";
import { hydrateLogs } from "@/lib/store/logSlice";
import useCurrencySettings from "@/lib/context/currency-context";

export default function QuickAddSale() {
  const dispatch = useAppDispatch();
  const { user } = useAuthState();
  const { showToast } = useToast();
  const { activeCurrency, currencySymbol, convertInputToStored } =
    useCurrencySettings();
  const amountInputLeftPadding = currencySymbol.length >= 3 ? 56 : 48;

  const [amountInput, setAmountInput] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (amount <= 0 || !user || isSubmitting) {
      showToast({
        type: "danger",
        message: "Please enter a valid amount greater than 0.",
        closable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const storedAmount = await convertInputToStored(amount, activeCurrency);

      await dispatch(
        addSale({
          userId: user.id,
          amount: storedAmount,
          originalAmount: amount,
          currencyCode: activeCurrency,
        }),
      ).unwrap();
      try {
        await Promise.all([
          dispatch(fetchSales(user.id)).unwrap(),
          dispatch(fetchSalesHistory(user.id)).unwrap(),
          dispatch(hydrateLogs()).unwrap(),
        ]);
      } catch {
        // Refresh failures should not mask a successful sale creation.
      }

      setAmount(0);
      setAmountInput("");
      Keyboard.dismiss();
      showToast({
        type: "success",
        message: "Sale added successfully.",
        closable: true,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String((error as { message?: unknown }).message ?? "") ||
              "An error occurred while adding the sale."
            : "An error occurred while adding the sale.";
      showToast({
        type: "danger",
        message,
        closable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^0-9.]/g, "");
      const [whole, ...fractionParts] = cleaned.split(".");
      const fraction = fractionParts.join("").slice(0, 2);
      const normalized =
        fractionParts.length > 0 ? `${whole}.${fraction}` : whole;

      setAmountInput(normalized);

      const parsed = Number(normalized);
      setAmount(Number.isNaN(parsed) ? 0 : parsed);
    },
    [setAmount, setAmountInput],
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <YStack style={{ marginTop: 24 }} gap="$2">
        <Paragraph
          style={{ color: "#0f172a", fontSize: 20, fontWeight: "800" }}
        >
          Quick Add Sale
        </Paragraph>
        <XStack gap="$2" style={{ alignItems: "center" }}>
          <YStack style={{ flex: 1, position: "relative" }}>
            <Input
              value={amountInput}
              onChangeText={handleChange}
              placeholder="0.00"
              keyboardType="decimal-pad"
              disabled={isSubmitting}
              onSubmitEditing={Keyboard.dismiss}
              style={{
                backgroundColor: "#f4f6fb",
                borderColor: "#cfd6e4",
                borderRadius: 10,
                height: 48,
                paddingLeft: amountInputLeftPadding,
                color: "#0f172a",
                fontWeight: "700",
              }}
              placeholderTextColor="#94a3b8"
            />
            <YStack
              style={{
                position: "absolute",
                left: 10,
                top: 0,
                bottom: 0,
                justifyContent: "center",
                minWidth: 34,
                alignItems: "center",
              }}
            >
              <Paragraph style={{ color: "#6b7280", fontWeight: "700" }}>
                {currencySymbol}
              </Paragraph>
            </YStack>
          </YStack>
          <Button
            style={{
              backgroundColor: "#111827",
              borderColor: "#111827",
              borderRadius: 10,
              height: 48,
              width: 96,
            }}
            disabled={isSubmitting}
            onPress={handleSubmit}
          >
            <XStack style={{ alignItems: "center" }} gap="$1.5">
              {isSubmitting ? (
                <Spinner />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="plus"
                    size={16}
                    color="#ffffff"
                  />
                  <Paragraph style={{ color: "#ffffff", fontWeight: "800" }}>
                    Add
                  </Paragraph>
                </>
              )}
            </XStack>
          </Button>
        </XStack>
      </YStack>
    </TouchableWithoutFeedback>
  );
}
