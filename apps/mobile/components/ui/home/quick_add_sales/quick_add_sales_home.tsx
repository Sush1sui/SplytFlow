import { Text } from "react-native";
import { Button, Card, Input } from "@/components/ui";
import { homeStylesGeneral as styles } from "@/components/ui/home/home-styles-general";
import { Spacing } from "@/constants/Theme";

export default function QuickAddSalesHome() {
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
