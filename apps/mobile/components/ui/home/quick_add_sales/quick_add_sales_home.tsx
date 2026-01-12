import { useState } from "react";
import { Text, Alert, View, ActivityIndicator } from "react-native";
import { Button, Card, Input } from "@/components/ui";
import { homeStylesGeneral as styles } from "@/components/ui/home/home-styles-general";
import { Spacing, Typography } from "@/constants/Theme";
import { useEarningsMutation } from "@/src/hooks/use-api";
import Colors from "@/constants/Colors";

export default function QuickAddSalesHome({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { createEarning, loading } = useEarningsMutation();

  const handleAddEarning = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    try {
      await createEarning({
        amount: parseFloat(amount),
        date,
        description: description.trim() || undefined,
      });

      Alert.alert("Success", "Earning added successfully!");
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      onSuccess?.();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to add earning"
      );
    }
  };

  return (
    <Card style={styles.quickAddCard}>
      <Text style={styles.cardTitle}>Quick Add Earning</Text>

      <Input
        label="Amount"
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        containerStyle={styles.input}
      />

      <Input
        label="Description (Optional)"
        placeholder="What did you earn from?"
        value={description}
        onChangeText={setDescription}
        containerStyle={styles.input}
      />

      {/* Date display - currently using today, can be made editable later */}
      <View
        style={{
          marginTop: Spacing.sm,
          padding: Spacing.md,
          backgroundColor: colors.backgroundSecondary,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: Typography.size.sm,
            color: colors.textSecondary,
            marginBottom: 4,
          }}
        >
          Date
        </Text>
        <Text
          style={{
            fontSize: Typography.size.base,
            color: colors.text,
            fontWeight: "600",
          }}
        >
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>

      <Button
        title="Add Earning"
        onPress={handleAddEarning}
        disabled={loading}
        loading={loading}
        fullWidth
        style={{ marginTop: Spacing.md }}
      />
    </Card>
  );
}
