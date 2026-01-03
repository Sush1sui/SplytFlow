import { Text } from "react-native";
import { Button, Card, Input } from "@/components/ui";
import { HomeStylesType } from "@/app/(tabs)/home";
import { Spacing } from "@/constants/Theme";

export default function QuickAddSalesHome({
  styles,
}: {
  styles: HomeStylesType;
}) {
  return (
    <Card style={styles.quickAddCard}>
      <Text style={styles.cardTitle}>Quick Add Sale</Text>

      <Input
        label="Amount"
        placeholder="0.00"
        keyboardType="decimal-pad"
        containerStyle={styles.input}
      />

      <Input
        label="Description (Optional)"
        placeholder="What did you sell?"
        containerStyle={styles.input}
      />

      <Button
        title="Add Sale"
        onPress={() => console.log("Add sale")}
        fullWidth
        style={{ marginTop: Spacing.sm }}
      />
    </Card>
  );
}
